// Modello dati e regole di business: fondi, transazioni, accantonamento
// automatico, stima obiettivi. Nessun riferimento al DOM in questo file.

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const DEFAULT_SETTINGS = {
  theme: 'auto',
  salaryDefaultAmount: 70,
  workFund: {
    monthlyAmount: 30,
    lastAllocatedMonth: null
  },
  notificationsEnabled: false,
  sync: {
    enabled: false,
    provider: null,
    config: null,
    syncCode: null
  },
  onboarded: false
};

function defaultFunds() {
  return [
    {
      id: 'fondo-lavoro',
      name: 'Fondo Lavoro',
      emoji: '💼',
      color: '#4f46e5',
      system: true,
      splitPercent: 0,
      goalAmount: null,
      balance: 0,
      order: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'fund-macbook',
      name: 'MacBook',
      emoji: '💻',
      color: '#0ea5e9',
      system: false,
      splitPercent: 50,
      goalAmount: 1500,
      balance: 0,
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'fund-raffaella',
      name: 'Raffaella - Uscite',
      emoji: '🌷',
      color: '#ec4899',
      system: false,
      splitPercent: 50,
      goalAmount: null,
      balance: 0,
      order: 2,
      createdAt: new Date().toISOString()
    }
  ];
}

const Store = {
  settings: null,
  funds: [],
  transactions: [],
  listeners: new Set(),

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
  emit(event) {
    this.listeners.forEach((fn) => fn(event));
  },

  async init() {
    const savedSettings = await DB.kvGet('settings');
    const freshDefaults = typeof structuredClone === 'function' ? structuredClone(DEFAULT_SETTINGS) : JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.settings = deepMerge(freshDefaults, savedSettings || {});

    let funds = await DB.getAll('funds');
    if (!funds || funds.length === 0) {
      funds = defaultFunds();
      await DB.bulkPut('funds', funds);
    }
    this.funds = funds.sort((a, b) => a.order - b.order);

    this.transactions = (await DB.getAll('transactions')) || [];
    this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!savedSettings) {
      await this.saveSettings();
    }
    this.emit({ type: 'init' });
  },

  async saveSettings() {
    await DB.kvSet('settings', this.settings);
    this.emit({ type: 'settings' });
    if (window.Sync) window.Sync.notifyLocalChange();
  },

  getFund(id) {
    return this.funds.find((f) => f.id === id);
  },

  availableCash() {
    // Contanti ricevuti/spesi non ancora assegnati a un fondo specifico.
    let total = 0;
    for (const t of this.transactions) {
      if (t.kind === 'income') total += t.amount;
      else if (t.kind === 'expense') total -= t.amount;
      else if (t.kind === 'allocation') total -= t.amount;
    }
    return round2(total);
  },

  totalInFunds() {
    return round2(this.funds.reduce((sum, f) => sum + f.balance, 0));
  },

  totalPatrimony() {
    return round2(this.availableCash() + this.totalInFunds());
  },

  splitFunds() {
    return this.funds.filter((f) => !f.system);
  },

  async addTransaction(partial) {
    const t = {
      id: uid(),
      date: new Date().toISOString(),
      kind: partial.kind, // 'income' | 'expense' | 'allocation'
      amount: round2(partial.amount),
      description: partial.description || '',
      category: partial.category || null,
      fundId: partial.fundId || null,
      meta: partial.meta || null
    };
    this.transactions.unshift(t);
    await DB.put('transactions', t);
    if (t.fundId) {
      const fund = this.getFund(t.fundId);
      if (fund) {
        fund.balance = round2(fund.balance + (t.kind === 'allocation' ? t.amount : t.kind === 'expense' ? -t.amount : t.amount));
        await DB.put('funds', fund);
      }
    }
    this.emit({ type: 'transaction', transaction: t });
    if (window.Sync) window.Sync.notifyLocalChange();
    return t;
  },

  async deleteTransaction(id) {
    const t = this.transactions.find((x) => x.id === id);
    if (!t) return;
    this.transactions = this.transactions.filter((x) => x.id !== id);
    await DB.delete('transactions', id);
    if (t.fundId) {
      const fund = this.getFund(t.fundId);
      if (fund) {
        fund.balance = round2(fund.balance - (t.kind === 'allocation' ? t.amount : t.kind === 'expense' ? -t.amount : t.amount));
        await DB.put('funds', fund);
      }
    }
    this.emit({ type: 'transaction-deleted', id });
    if (window.Sync) window.Sync.notifyLocalChange();
  },

  async upsertFund(fund) {
    const existing = this.getFund(fund.id);
    const merged = existing ? { ...existing, ...fund } : {
      id: fund.id || uid(),
      order: this.funds.length,
      balance: 0,
      system: false,
      createdAt: new Date().toISOString(),
      ...fund
    };
    await DB.put('funds', merged);
    const idx = this.funds.findIndex((f) => f.id === merged.id);
    if (idx >= 0) this.funds[idx] = merged;
    else this.funds.push(merged);
    this.emit({ type: 'fund' });
    if (window.Sync) window.Sync.notifyLocalChange();
    return merged;
  },

  async removeFund(id) {
    const fund = this.getFund(id);
    if (!fund || fund.system) return;
    await DB.delete('funds', id);
    this.funds = this.funds.filter((f) => f.id !== id);
    this.emit({ type: 'fund' });
    if (window.Sync) window.Sync.notifyLocalChange();
  },

  // Alloca il rimanente disponibile: prima il fondo lavoro mensile (se non
  // ancora fatto questo mese), poi il resto diviso tra i fondi personalizzati
  // secondo le percentuali configurate. Ritorna un riepilogo delle mosse.
  planAllocation(availableOverride = null) {
    const available = availableOverride !== null ? availableOverride : this.availableCash();
    const plan = { workFund: 0, splits: [], leftover: 0, workFundAlreadyDone: false };
    let remaining = available;

    const wf = this.getFund('fondo-lavoro');
    const currentMonth = monthKey();
    const alreadyDone = this.settings.workFund.lastAllocatedMonth === currentMonth;
    plan.workFundAlreadyDone = alreadyDone;

    if (!alreadyDone && wf) {
      const amount = Math.min(this.settings.workFund.monthlyAmount, Math.max(0, remaining));
      if (amount > 0) {
        plan.workFund = round2(amount);
        remaining = round2(remaining - amount);
      }
    }

    const splitFunds = this.splitFunds();
    const totalPercent = splitFunds.reduce((s, f) => s + (f.splitPercent || 0), 0) || 1;
    if (remaining > 0 && splitFunds.length) {
      let allocatedSoFar = 0;
      splitFunds.forEach((f, idx) => {
        const isLast = idx === splitFunds.length - 1;
        const share = isLast
          ? round2(remaining - allocatedSoFar)
          : round2((remaining * (f.splitPercent || 0)) / totalPercent);
        allocatedSoFar = round2(allocatedSoFar + share);
        if (share > 0) plan.splits.push({ fundId: f.id, name: f.name, amount: share });
      });
    } else {
      plan.leftover = round2(remaining);
    }
    return plan;
  },

  async applyAllocation(plan) {
    const currentMonth = monthKey();
    if (plan.workFund > 0) {
      await this.addTransaction({
        kind: 'allocation',
        amount: plan.workFund,
        description: 'Accantonamento mensile',
        fundId: 'fondo-lavoro',
        category: 'accantonamento'
      });
      this.settings.workFund.lastAllocatedMonth = currentMonth;
      await this.saveSettings();
      if (window.Notifications) {
        const wf = this.getFund('fondo-lavoro');
        window.Notifications.notify(
          'Fondo Lavoro pronto 💼',
          `Accantonati ${formatMoney(plan.workFund)}. Totale fondo: ${formatMoney(wf.balance)}.`
        );
      }
    }
    for (const split of plan.splits) {
      await this.addTransaction({
        kind: 'allocation',
        amount: split.amount,
        description: 'Suddivisione automatica',
        fundId: split.fundId,
        category: 'suddivisione'
      });
    }
  },

  // Storico mensile netto versato in un fondo, per stimare la velocità di risparmio.
  monthlyContributionRate(fundId, months = 6) {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const relevant = this.transactions.filter(
      (t) => t.fundId === fundId && t.kind === 'allocation' && new Date(t.date) >= cutoff
    );
    if (!relevant.length) return 0;
    const total = relevant.reduce((s, t) => s + t.amount, 0);
    const firstDate = relevant.reduce((min, t) => (new Date(t.date) < min ? new Date(t.date) : min), now);
    const monthsSpan = Math.max(1, (now - firstDate) / (1000 * 60 * 60 * 24 * 30.44));
    return round2(total / monthsSpan);
  },

  estimateGoalDate(fund) {
    if (!fund.goalAmount) return null;
    const remaining = round2(fund.goalAmount - fund.balance);
    if (remaining <= 0) return { done: true, date: null, monthsNeeded: 0 };
    const rate = this.monthlyContributionRate(fund.id);
    if (rate <= 0) return { done: false, date: null, monthsNeeded: null, rate };
    const monthsNeeded = remaining / rate;
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + Math.ceil(monthsNeeded));
    return { done: false, date, monthsNeeded, rate };
  }
};

function deepMerge(base, override) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(override || {})) {
    if (
      override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) &&
      base && typeof base[key] === 'object' && !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], override[key]);
    } else if (override[key] !== undefined) {
      out[key] = override[key];
    }
  }
  return out;
}

function formatMoney(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n || 0);
}

function formatDateShort(d) {
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(new Date(d));
}

function formatMonthYear(d) {
  return new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(d));
}

window.Store = Store;
window.uid = uid;
window.formatMoney = formatMoney;
window.formatDateShort = formatDateShort;
window.formatMonthYear = formatMonthYear;
window.round2 = round2;
