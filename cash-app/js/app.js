(function () {
  const contentEl = document.getElementById('content');
  const modalRoot = document.getElementById('modalRoot');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const sheetBackdrop = document.getElementById('sheetBackdrop');
  const fabSheet = document.getElementById('fabSheet');
  const tabbar = document.getElementById('tabbar');
  const syncIndicator = document.getElementById('syncIndicator');
  const toastStack = document.getElementById('toastStack');
  const installBtn = document.getElementById('installBtn');

  let currentTab = 'dashboard';
  let historyFilter = 'all';
  let deferredInstallPrompt = null;

  const EMOJI_CHOICES = ['💼', '💻', '🌷', '🏖️', '🚗', '🏠', '🎓', '🎁', '🐾', '📱', '🛠️', '✈️', '🍿', '🎮'];
  const COLOR_CHOICES = ['#4f46e5', '#0ea5e9', '#ec4899', '#22c55e', '#f97316', '#eab308', '#14b8a6', '#a855f7'];

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------------------------- Boot ---------------------------- */
  async function boot() {
    await Store.init();
    applyTheme();
    await Sync.init();
    updateSyncIndicator();
    wireGlobalEvents();
    handleShortcutAction();
    render();
    registerServiceWorker();
    setupInstallPrompt();
  }

  function applyTheme() {
    const theme = Store.settings.theme;
    if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
  }

  function handleShortcutAction() {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'salary') setTimeout(openSalaryModal, 200);
    if (action === 'expense') setTimeout(openExpenseModal, 200);
  }

  Store.onChange(() => {
    render();
    updateSyncIndicator();
  });
  window.addEventListener('sync-status', updateSyncIndicator);
  window.addEventListener('sync-applied', () => {
    render();
    showToast('Sincronizzato', 'Dati aggiornati da un altro dispositivo');
  });
  window.addEventListener('app-toast', (e) => showToast(e.detail.title, e.detail.body));

  function updateSyncIndicator() {
    const cfg = Store.settings?.sync;
    if (cfg && cfg.enabled) {
      const map = { connected: 'Sincronizzato automaticamente', connecting: 'Connessione…', error: 'Errore di sincronizzazione', offline: 'Sincronizzazione in pausa' };
      syncIndicator.textContent = map[Sync.status] || 'Sincronizzazione attiva';
    } else {
      syncIndicator.textContent = 'Solo su questo dispositivo';
    }
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch((e) => console.error('SW registration failed', e));
    }
  }

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      installBtn.hidden = false;
    });
    installBtn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installBtn.hidden = true;
      } else {
        setTab('settings');
        showToast('Installazione', 'Su iPhone: tocca Condividi poi "Aggiungi alla schermata Home".');
      }
    });
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isIOS && !isStandalone) installBtn.hidden = false;
  }

  /* ---------------------------- Routing ---------------------------- */
  function setTab(tab) {
    currentTab = tab;
    render();
    contentEl.scrollTo({ top: 0 });
  }

  function render() {
    if (!Store.settings) return;
    switch (currentTab) {
      case 'dashboard': renderDashboard(); break;
      case 'history': renderHistory(); break;
      case 'goals': renderGoals(); break;
      case 'settings': renderSettings(); break;
    }
    tabbar.querySelectorAll('.tab-btn[data-tab]').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === currentTab));
  }

  /* ---------------------------- Dashboard ---------------------------- */
  function renderDashboard() {
    const available = Store.availableCash();
    const total = Store.totalPatrimony();
    const inFunds = Store.totalInFunds();

    const pieSegments = [
      { label: 'Disponibile', value: Math.max(0, available), color: 'var(--track)' },
      ...Store.funds.map((f) => ({ label: f.name, value: f.balance, color: f.color }))
    ];
    const pieTotal = round2(pieSegments.reduce((s, seg) => s + Math.max(0, seg.value), 0));

    const legend = [
      { label: 'Disponibile', value: available, color: 'var(--track)' },
      ...Store.funds.map((f) => ({ label: f.name, value: f.balance, color: f.color }))
    ]
      .filter((s) => Math.abs(s.value) > 0.004 || s.label === 'Disponibile')
      .map((s) => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${s.color === 'var(--track)' ? '#c7c7cc' : s.color}"></span>
          <span class="legend-name">${escapeHtml(s.label)}</span>
          <span class="legend-value" style="${s.value < 0 ? 'color:var(--danger)' : ''}">${formatMoney(s.value)}</span>
        </div>`).join('');

    const pendingBtn = available > 0.004
      ? `<button class="hero-pending" data-action="quick-allocate">🪄 Alloca ${formatMoney(available)} ora</button>`
      : '';

    const recent = Store.transactions.slice(0, 6);
    const recentHtml = recent.length
      ? `<div class="tx-list">${recent.map(txRow).join('')}</div>`
      : `<div class="empty-state"><span class="emoji">🧾</span>Nessuna transazione ancora.<br/>Premi + per iniziare.</div>`;

    const months = lastMonthsNet(6);

    contentEl.innerHTML = `
      <div class="hero-balance">
        <p class="hero-label">Patrimonio totale in contanti</p>
        <p class="hero-amount">${formatMoney(total)}</p>
        <p class="hero-sub">Disponibile ${formatMoney(available)} · Nei fondi ${formatMoney(inFunds)}</p>
        ${available < -0.004 ? `<p class="hero-sub" style="margin-top:6px">⚠️ Hai speso più contanti di quanti ne avevi registrati come disponibili</p>` : ''}
        ${pendingBtn}
      </div>

      <div class="quick-actions">
        <button class="qa-btn primary" data-action="open-salary">
          <span class="qa-emoji">💰</span><span class="qa-label">Ho ricevuto lo stipendio</span>
        </button>
        <button class="qa-btn" data-action="open-expense">
          <span class="qa-emoji">🧾</span><span class="qa-label">Aggiungi spesa</span>
        </button>
      </div>

      <h2 class="section-title">Ripartizione</h2>
      <div class="card">
        <div class="donut-wrap">
          ${Charts.donut(pieSegments.map((s) => ({ value: s.value, color: s.color === 'var(--track)' ? '#c7c7cc' : s.color })), { centerLabel: formatMoney(pieTotal), centerSub: 'totale' })}
          <div class="legend">${legend}</div>
        </div>
      </div>

      <h2 class="section-title">I tuoi fondi</h2>
      ${Store.funds.map(fundCard).join('')}

      <h2 class="section-title">Andamento (6 mesi)</h2>
      <div class="card">${Charts.bars(months)}</div>

      <div class="section-header-row">
        <h2 class="section-title" style="margin:0">Ultime operazioni</h2>
        <button class="link-btn" data-action="goto-history">Vedi tutto</button>
      </div>
      <div class="card">${recentHtml}</div>
    `;
  }

  function fundCard(fund) {
    const goal = Store.estimateGoalDate(fund);
    let goalHtml = '';
    if (fund.goalAmount) {
      const percent = Math.min(100, (fund.balance / fund.goalAmount) * 100);
      const etaText = goal.done
        ? '🎉 Obiettivo raggiunto!'
        : goal.date
          ? `stima ${formatMonthYear(goal.date)}`
          : 'aggiungi versamenti per stimare la data';
      goalHtml = `
        <div>
          ${Charts.progress(percent, fund.color)}
          <div class="fund-goal-row">
            <span>${formatMoney(fund.balance)} di ${formatMoney(fund.goalAmount)}</span>
            <span>${etaText}</span>
          </div>
        </div>`;
    }
    return `
      <div class="card fund-card">
        <div class="fund-head">
          <div class="fund-emoji" style="background:${fund.color}22;color:${fund.color}">${fund.emoji}</div>
          <div>
            <p class="fund-name">${escapeHtml(fund.name)}</p>
            <p class="fund-meta">${fund.system ? `Accantonamento ${formatMoney(Store.settings.workFund.monthlyAmount)}/mese` : `${fund.splitPercent}% del rimanente`}</p>
          </div>
          <div class="fund-balance">${formatMoney(fund.balance)}</div>
        </div>
        ${goalHtml}
      </div>`;
  }

  function txRow(t) {
    const fund = t.fundId ? Store.getFund(t.fundId) : null;
    const icon = fund ? fund.emoji : t.kind === 'income' ? '💰' : '🧾';
    const bg = fund ? fund.color : t.kind === 'income' ? 'var(--success)' : 'var(--danger)';
    const sign = t.kind === 'income' ? '+' : t.kind === 'allocation' ? '→' : '−';
    const amountClass = t.kind === 'income' ? 'positive' : 'negative';
    return `
      <div class="tx-row">
        <div class="tx-icon" style="background:${bg}22;color:${bg}">${icon}</div>
        <div class="tx-info">
          <p class="tx-desc">${escapeHtml(t.description || (t.kind === 'income' ? 'Entrata' : 'Spesa'))}</p>
          <p class="tx-date">${formatDateShort(t.date)}${fund ? ' · ' + escapeHtml(fund.name) : ''}</p>
        </div>
        <div class="tx-amount ${amountClass}">${sign} ${formatMoney(Math.abs(t.amount))}</div>
        <button class="tx-delete" data-action="delete-tx" data-id="${t.id}" aria-label="Elimina">✕</button>
      </div>`;
  }

  function lastMonthsNet(count) {
    const now = new Date();
    const points = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(d).replace('.', '');
      const monthStart = d;
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      let net = 0;
      for (const t of Store.transactions) {
        const td = new Date(t.date);
        if (td >= monthStart && td < monthEnd) {
          if (t.kind === 'income') net += t.amount;
          else if (t.kind === 'expense') net -= t.amount;
        }
      }
      points.push({ label, value: round2(net) });
    }
    return points;
  }

  /* ---------------------------- History ---------------------------- */
  function renderHistory() {
    const filters = [
      { id: 'all', label: 'Tutti' },
      { id: 'income', label: 'Entrate' },
      { id: 'expense', label: 'Spese' },
      { id: 'allocation', label: 'Accantonamenti' }
    ];
    const chips = filters.map((f) => `<button class="filter-chip ${historyFilter === f.id ? 'is-active' : ''}" data-action="filter-history" data-filter="${f.id}">${f.label}</button>`).join('');

    const list = Store.transactions.filter((t) => historyFilter === 'all' || t.kind === historyFilter);
    const groups = groupByMonth(list);

    const body = groups.length
      ? groups.map((g) => `
          <h2 class="section-title">${g.label}</h2>
          <div class="card"><div class="tx-list">${g.items.map(txRow).join('')}</div></div>
        `).join('')
      : `<div class="empty-state"><span class="emoji">📭</span>Nessuna transazione in questa categoria.</div>`;

    contentEl.innerHTML = `
      <h2 class="section-title" style="margin-top:16px">Cronologia</h2>
      <div class="filter-row">${chips}</div>
      ${body}
    `;
  }

  function groupByMonth(list) {
    const map = new Map();
    for (const t of list) {
      const key = monthKey(new Date(t.date));
      if (!map.has(key)) map.set(key, { label: capitalize(formatMonthYear(t.date)), items: [] });
      map.get(key).items.push(t);
    }
    return Array.from(map.values());
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------------------------- Goals ---------------------------- */
  function renderGoals() {
    const funds = Store.splitFunds();
    const cards = funds.map((fund) => {
      const goal = Store.estimateGoalDate(fund);
      let etaHtml = '<span>Nessun obiettivo impostato</span>';
      let percent = 0;
      if (fund.goalAmount) {
        percent = Math.min(100, (fund.balance / fund.goalAmount) * 100);
        etaHtml = goal.done
          ? '🎉 <strong>Obiettivo raggiunto!</strong>'
          : goal.date
            ? `Al ritmo attuale (${formatMoney(goal.rate)}/mese): <strong>${formatMonthYear(goal.date)}</strong>`
            : 'Aggiungi qualche versamento per stimare la data';
      }
      const ringSegments = fund.goalAmount
        ? [{ value: Math.min(fund.balance, fund.goalAmount), color: fund.color }, { value: Math.max(0, fund.goalAmount - fund.balance), color: '#e5e5ea' }]
        : [{ value: 1, color: '#e5e5ea' }];
      const ringCenter = fund.goalAmount ? `${Math.round(percent)}%` : '—';
      return `
        <div class="card goal-card">
          <div class="goal-ring-row">
            ${Charts.donut(ringSegments, { size: 96, thickness: 12, centerLabel: ringCenter, centerSub: '' })}
            <div class="goal-info">
              <p class="fund-name">${fund.emoji} ${escapeHtml(fund.name)}</p>
              <p class="fund-meta">${formatMoney(fund.balance)}${fund.goalAmount ? ' di ' + formatMoney(fund.goalAmount) : ''}</p>
              <p class="goal-eta">${etaHtml}</p>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" data-action="edit-fund" data-id="${fund.id}">Modifica obiettivo</button>
        </div>`;
    }).join('');

    contentEl.innerHTML = `
      <h2 class="section-title" style="margin-top:16px">Obiettivi</h2>
      ${cards || `<div class="empty-state"><span class="emoji">🎯</span>Nessun fondo personalizzato ancora.</div>`}
      <button class="btn btn-primary" style="margin-top:14px" data-action="add-fund">+ Nuovo fondo</button>
    `;
  }

  /* ---------------------------- Settings ---------------------------- */
  function renderSettings() {
    const s = Store.settings;
    const theme = s.theme;
    const fundsRows = Store.funds.map((f) => `
      <div class="fund-edit-row">
        <div class="fund-edit-swatch" style="background:${f.color}22;color:${f.color};display:flex;align-items:center;justify-content:center;font-size:15px">${f.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px">${escapeHtml(f.name)}</div>
          <div class="fund-meta">${f.system ? 'Fondo di sistema' : `${f.splitPercent}% del rimanente${f.goalAmount ? ' · obiettivo ' + formatMoney(f.goalAmount) : ''}`}</div>
        </div>
        <button class="link-btn" data-action="edit-fund" data-id="${f.id}">Modifica</button>
      </div>`).join('');

    const cfg = s.sync;
    const statusClass = Sync.status;
    const statusLabel = { connected: 'Connesso', connecting: 'Connessione…', error: 'Errore', offline: 'Non attivo' }[Sync.status] || 'Non attivo';

    contentEl.innerHTML = `
      <h2 class="section-title" style="margin-top:16px">Aspetto</h2>
      <div class="card">
        <div class="settings-row">
          <span class="settings-row-label">Tema</span>
          <div class="segmented" style="width:200px">
            <button class="${theme === 'auto' ? 'is-active' : ''}" data-action="set-theme" data-theme="auto">Auto</button>
            <button class="${theme === 'light' ? 'is-active' : ''}" data-action="set-theme" data-theme="light">Chiaro</button>
            <button class="${theme === 'dark' ? 'is-active' : ''}" data-action="set-theme" data-theme="dark">Scuro</button>
          </div>
        </div>
      </div>

      <h2 class="section-title">Fondo Lavoro</h2>
      <div class="card">
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Accantonamento mensile</div>
            <div class="settings-row-desc">Trattenuto automaticamente ad ogni stipendio, una volta al mese</div>
          </div>
          <div class="amount-input-wrap">
            <input type="number" class="settings-input" id="workFundAmount" value="${s.workFund.monthlyAmount}" min="0" step="1" />
          </div>
        </div>
      </div>

      <h2 class="section-title">Fondi personalizzati</h2>
      <div class="card">
        ${fundsRows}
      </div>
      <button class="btn btn-secondary" style="margin-top:10px" data-action="add-fund">+ Aggiungi fondo</button>

      <h2 class="section-title">Notifiche</h2>
      <div class="card">
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Avvisami quando un fondo è pronto</div>
            <div class="settings-row-desc">Notifica quando l'app è aperta o appena riavviata</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="notifToggle" ${s.notificationsEnabled ? 'checked' : ''} />
            <span class="switch-track"></span>
          </label>
        </div>
      </div>

      <h2 class="section-title">Sincronizzazione</h2>
      <div class="card">
        <div class="settings-row-desc" style="margin-bottom:10px">Backup manuale: esporta o importa un file con tutti i tuoi dati.</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" data-action="export-json">⬇️ Esporta</button>
          <button class="btn btn-secondary" data-action="import-json">⬆️ Importa</button>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="settings-row">
          <div>
            <div class="settings-row-label"><span class="status-dot ${statusClass}"></span>Sincronizzazione automatica</div>
            <div class="settings-row-desc">${statusLabel} — richiede un progetto Firebase gratuito personale</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="syncToggle" ${cfg.enabled ? 'checked' : ''} />
            <span class="switch-track"></span>
          </label>
        </div>
        <div id="syncConfigArea" ${cfg.enabled ? '' : 'hidden'} style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
          <div class="field">
            <label>Configurazione Firebase (JSON del progetto)</label>
            <textarea class="settings-textarea" id="syncConfigInput" placeholder='{"apiKey":"...","projectId":"...","...":"..."}'>${cfg.config ? escapeHtml(JSON.stringify(cfg.config, null, 2)) : ''}</textarea>
          </div>
          <div class="field">
            <label>Codice di coppia (uguale su tutti i dispositivi)</label>
            <div style="display:flex;gap:8px">
              <input type="text" class="settings-input" id="syncCodeInput" style="flex:1;text-align:left;text-transform:uppercase" value="${cfg.syncCode || ''}" placeholder="ABC123" />
              <button class="btn btn-secondary btn-sm" data-action="generate-sync-code">Genera</button>
            </div>
          </div>
          <button class="btn btn-primary" data-action="save-sync-config">Connetti</button>
          <p class="settings-row-desc">Istruzioni per creare un progetto Firebase gratuito: vedi README.md nel repository.</p>
        </div>
      </div>

      <h2 class="section-title">Dati</h2>
      <div class="card">
        <button class="btn btn-danger" data-action="reset-data">Azzera tutti i dati</button>
      </div>
      <input type="file" id="importFileInput" accept="application/json" hidden />
      <p class="settings-row-desc" style="text-align:center;margin-top:20px">Contanti · versione locale · dati salvati su questo dispositivo</p>
    `;

    document.getElementById('workFundAmount').addEventListener('change', async (e) => {
      const val = Math.max(0, parseFloat(e.target.value) || 0);
      Store.settings.workFund.monthlyAmount = val;
      await Store.saveSettings();
    });

    document.getElementById('notifToggle').addEventListener('change', async (e) => {
      if (e.target.checked) {
        const perm = await Notifications.requestPermission();
        Store.settings.notificationsEnabled = perm === 'granted';
        if (perm !== 'granted') { e.target.checked = false; showToast('Notifiche', 'Permesso non concesso dal browser.'); }
      } else {
        Store.settings.notificationsEnabled = false;
      }
      await Store.saveSettings();
    });

    document.getElementById('syncToggle').addEventListener('change', async (e) => {
      const area = document.getElementById('syncConfigArea');
      area.hidden = !e.target.checked;
      if (!e.target.checked) {
        Store.settings.sync.enabled = false;
        await Store.saveSettings();
        await Sync.disconnect();
        updateSyncIndicator();
      }
    });
  }

  /* ---------------------------- Actions (event delegation) ---------------------------- */
  function wireGlobalEvents() {
    document.addEventListener('click', async (e) => {
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) { setTab(tabBtn.dataset.tab); return; }

      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.action;

      switch (action) {
        case 'open-fab': openFab(); break;
        case 'close-sheet': closeFab(); break;
        case 'open-salary': closeFab(); openSalaryModal(); break;
        case 'open-income': closeFab(); openIncomeModal(); break;
        case 'open-expense': closeFab(); openExpenseModal(); break;
        case 'close-modal': closeModal(); break;
        case 'goto-history': setTab('history'); break;
        case 'quick-allocate': openAllocationStage(); break;
        case 'filter-history': historyFilter = actionEl.dataset.filter; renderHistory(); break;
        case 'delete-tx': await confirmAndDeleteTx(actionEl.dataset.id); break;
        case 'set-theme': Store.settings.theme = actionEl.dataset.theme; await Store.saveSettings(); applyTheme(); break;
        case 'add-fund': openFundModal(null); break;
        case 'edit-fund': openFundModal(actionEl.dataset.id); break;
        case 'export-json': Sync.exportJSON(); break;
        case 'import-json': document.getElementById('importFileInput').click(); break;
        case 'reset-data': await resetAllData(); break;
        case 'generate-sync-code': document.getElementById('syncCodeInput').value = Sync.randomSyncCode(); break;
        case 'save-sync-config': await saveSyncConfig(); break;
      }
    });

    sheetBackdrop.addEventListener('click', closeFab);
    modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('change', async (e) => {
      if (e.target.id === 'importFileInput' && e.target.files[0]) {
        try {
          await Sync.importJSON(e.target.files[0]);
          showToast('Importato', 'I dati sono stati ripristinati.');
        } catch (err) {
          showToast('Errore', 'File non valido.');
        }
        e.target.value = '';
      }
    });
  }

  async function confirmAndDeleteTx(id) {
    if (!confirm('Eliminare questa transazione? Il saldo dei fondi verrà aggiornato di conseguenza.')) return;
    await Store.deleteTransaction(id);
  }

  async function resetAllData() {
    if (!confirm('Questo cancellerà definitivamente tutte le transazioni e i fondi da questo dispositivo. Continuare?')) return;
    await DB.clear('funds');
    await DB.clear('transactions');
    await DB.kvSet('settings', DEFAULT_SETTINGS);
    await Store.init();
    showToast('Azzerato', 'Tutti i dati locali sono stati cancellati.');
  }

  async function saveSyncConfig() {
    const configText = document.getElementById('syncConfigInput').value.trim();
    const code = document.getElementById('syncCodeInput').value.trim().toUpperCase();
    if (!configText || !code) { showToast('Sincronizzazione', 'Inserisci configurazione e codice.'); return; }
    let config;
    try { config = JSON.parse(configText); } catch { showToast('Errore', 'JSON di configurazione non valido.'); return; }
    Store.settings.sync = { enabled: true, provider: 'firebase', config, syncCode: code };
    await Store.saveSettings();
    await Sync.connect(config, code);
    await Sync.pushState();
    updateSyncIndicator();
    showToast('Sincronizzazione', 'Connessione avviata su questo dispositivo.');
  }

  /* ---------------------------- Action sheet & modal shell ---------------------------- */
  function openFab() {
    sheetBackdrop.classList.add('is-open');
    fabSheet.classList.add('is-open');
  }
  function closeFab() {
    sheetBackdrop.classList.remove('is-open');
    fabSheet.classList.remove('is-open');
  }

  function openModal(id, title, bodyHtml, opts = {}) {
    modalBackdrop.classList.add('is-open');
    modalRoot.innerHTML = `<div class="modal" id="${id}">
      <div class="modal-header"><h2 class="modal-title">${title}</h2><button class="modal-close" data-action="close-modal">✕</button></div>
      <div class="modal-body">${bodyHtml}</div>
    </div>`;
    const modal = document.getElementById(id);
    requestAnimationFrame(() => modal.classList.add('is-open'));
    if (opts.onMount) opts.onMount(modal);
  }
  function updateModalBody(bodyHtml, onMount) {
    const modal = modalRoot.querySelector('.modal');
    if (!modal) return;
    modal.querySelector('.modal-body').innerHTML = bodyHtml;
    if (onMount) onMount(modal);
  }
  function closeModal() {
    modalBackdrop.classList.remove('is-open');
    const modal = modalRoot.querySelector('.modal');
    if (modal) modal.classList.remove('is-open');
    setTimeout(() => { modalRoot.innerHTML = ''; }, 220);
  }

  function shake(el) {
    el.style.animation = 'none';
    requestAnimationFrame(() => { el.style.animation = ''; el.focus(); });
  }

  function showToast(title, body) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(body || '')}`;
    toastStack.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  /* ---------------------------- Salary flow ---------------------------- */
  function openSalaryModal() {
    const state = { quickExpenses: [] };
    openModal('salaryModal', 'Ho ricevuto lo stipendio', salaryInputBody(), {
      onMount: (modal) => mountSalaryInput(modal, state)
    });
  }

  function salaryInputBody() {
    return `
      <div class="field">
        <label>Importo stipendio ricevuto</label>
        <input type="number" inputmode="decimal" id="salaryAmount" value="${Store.settings.salaryDefaultAmount}" min="0" step="0.01" />
      </div>
      <div class="field">
        <label>Spese rapide da dedurre subito (facoltativo)</label>
        <div class="quick-expense-row">
          <input type="text" id="qeDesc" placeholder="Es. Benzina" />
          <input type="number" inputmode="decimal" id="qeAmount" placeholder="€" style="max-width:90px" />
          <button class="btn btn-secondary btn-sm" data-action="add-quick-expense" type="button">+</button>
        </div>
        <div class="quick-expense-list" id="qeList"></div>
      </div>
      <div class="summary-line"><span>Disponibile dopo le spese</span><strong id="salarySummary">—</strong></div>
      <button class="btn btn-primary" data-action="salary-continue">Continua</button>
    `;
  }

  function mountSalaryInput(modal, state) {
    const amountInput = modal.querySelector('#salaryAmount');
    const qeList = modal.querySelector('#qeList');

    function paintExpenses() {
      qeList.innerHTML = state.quickExpenses.map((qe, i) => `
        <div class="quick-expense-item">
          <span class="qe-desc">${escapeHtml(qe.desc)}</span>
          <span>${formatMoney(qe.amount)}</span>
          <button data-remove-index="${i}" type="button">✕</button>
        </div>`).join('');
    }
    function updateSummary() {
      const amount = parseFloat(amountInput.value) || 0;
      const expensesTotal = state.quickExpenses.reduce((s, e) => s + e.amount, 0);
      modal.querySelector('#salarySummary').textContent = formatMoney(round2(Store.availableCash() + amount - expensesTotal));
      paintExpenses();
    }

    amountInput.addEventListener('input', updateSummary);

    modal.querySelector('[data-action="add-quick-expense"]').addEventListener('click', () => {
      const descInput = modal.querySelector('#qeDesc');
      const amtInput = modal.querySelector('#qeAmount');
      const desc = descInput.value.trim() || 'Spesa';
      const amt = parseFloat(amtInput.value);
      if (!amt || amt <= 0) { shake(amtInput); return; }
      state.quickExpenses.push({ desc, amount: round2(amt) });
      descInput.value = '';
      amtInput.value = '';
      updateSummary();
    });

    qeList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-index]');
      if (!btn) return;
      state.quickExpenses.splice(Number(btn.dataset.removeIndex), 1);
      updateSummary();
    });

    modal.querySelector('[data-action="salary-continue"]').addEventListener('click', async () => {
      const amount = parseFloat(amountInput.value);
      if (!amount || amount <= 0) { shake(amountInput); return; }
      await Store.addTransaction({ kind: 'income', amount, description: 'Stipendio', category: 'stipendio' });
      for (const qe of state.quickExpenses) {
        await Store.addTransaction({ kind: 'expense', amount: qe.amount, description: qe.desc, category: 'spesa-rapida' });
      }
      Store.settings.salaryDefaultAmount = amount;
      await Store.saveSettings();
      renderAllocationStage(modal);
    });

    updateSummary();
  }

  function openAllocationStage() {
    openModal('allocateModal', 'Alloca fondi', '<div class="empty-state">Calcolo…</div>', {
      onMount: (modal) => renderAllocationStage(modal)
    });
  }

  function renderAllocationStage(modal) {
    const plan = Store.planAllocation();
    const rows = [];
    if (plan.workFundAlreadyDone) {
      rows.push(`<div class="allocation-row"><span>💼 Fondo Lavoro</span><span>già accantonato questo mese</span></div>`);
    } else if (plan.workFund > 0) {
      rows.push(`<div class="allocation-row"><span>💼 Fondo Lavoro</span><span>+ ${formatMoney(plan.workFund)}</span></div>`);
    }
    plan.splits.forEach((s) => {
      const fund = Store.getFund(s.fundId);
      rows.push(`<div class="allocation-row"><span>${fund ? fund.emoji : ''} ${escapeHtml(s.name)}</span><span>+ ${formatMoney(s.amount)}</span></div>`);
    });
    const totalAllocated = round2(plan.workFund + plan.splits.reduce((s, x) => s + x.amount, 0));
    rows.push(`<div class="allocation-row total"><span>Totale allocato</span><span>${formatMoney(totalAllocated)}</span></div>`);

    const body = `
      <p class="settings-row-desc">Disponibile da suddividere: <strong style="color:var(--text)">${formatMoney(Store.availableCash())}</strong></p>
      <div class="allocation-preview">${rows.join('')}</div>
      <button class="btn btn-primary" data-action="confirm-allocate" type="button">Conferma allocazione</button>
      <button class="btn btn-secondary" data-action="close-modal" type="button">Fai più tardi</button>
    `;
    modal.querySelector('.modal-title').textContent = 'Alloca fondi';
    updateModalBody(body, (m) => {
      m.querySelector('[data-action="confirm-allocate"]').addEventListener('click', async () => {
        await Store.applyAllocation(plan);
        closeModal();
        showToast('Fondi aggiornati', 'Allocazione completata con successo.');
      });
    });
  }

  /* ---------------------------- Income / Expense modals ---------------------------- */
  function openIncomeModal() {
    const body = `
      <div class="field"><label>Importo</label><input type="number" inputmode="decimal" id="txAmount" min="0" step="0.01" /></div>
      <div class="field"><label>Descrizione</label><input type="text" id="txDesc" placeholder="Es. Regalo, rimborso…" /></div>
      <button class="btn btn-primary" data-action="save-income" type="button">Aggiungi entrata</button>
    `;
    openModal('incomeModal', 'Altra entrata', body, {
      onMount: (modal) => {
        modal.querySelector('[data-action="save-income"]').addEventListener('click', async () => {
          const amount = parseFloat(modal.querySelector('#txAmount').value);
          if (!amount || amount <= 0) { shake(modal.querySelector('#txAmount')); return; }
          const desc = modal.querySelector('#txDesc').value.trim() || 'Entrata';
          await Store.addTransaction({ kind: 'income', amount, description: desc, category: 'entrata' });
          closeModal();
          showToast('Entrata registrata', formatMoney(amount));
        });
      }
    });
  }

  function openExpenseModal() {
    const body = `
      <div class="field"><label>Importo</label><input type="number" inputmode="decimal" id="txAmount" min="0" step="0.01" /></div>
      <div class="field"><label>Descrizione</label><input type="text" id="txDesc" placeholder="Es. Benzina, spesa, bar…" /></div>
      <button class="btn btn-primary" data-action="save-expense" type="button">Aggiungi spesa</button>
    `;
    openModal('expenseModal', 'Aggiungi spesa', body, {
      onMount: (modal) => {
        modal.querySelector('[data-action="save-expense"]').addEventListener('click', async () => {
          const amount = parseFloat(modal.querySelector('#txAmount').value);
          if (!amount || amount <= 0) { shake(modal.querySelector('#txAmount')); return; }
          const desc = modal.querySelector('#txDesc').value.trim() || 'Spesa';
          await Store.addTransaction({ kind: 'expense', amount, description: desc, category: 'spesa' });
          closeModal();
          showToast('Spesa registrata', formatMoney(amount));
        });
      }
    });
  }

  /* ---------------------------- Fund edit modal ---------------------------- */
  function openFundModal(fundId) {
    const fund = fundId ? Store.getFund(fundId) : null;
    const isNew = !fund;
    const emoji = fund ? fund.emoji : EMOJI_CHOICES[Store.funds.length % EMOJI_CHOICES.length];
    const color = fund ? fund.color : COLOR_CHOICES[Store.funds.length % COLOR_CHOICES.length];

    const emojiButtons = EMOJI_CHOICES.map((em) => `<button type="button" class="btn btn-secondary btn-sm" data-emoji="${em}" style="padding:8px 10px;${em === emoji ? 'outline:2px solid var(--accent)' : ''}">${em}</button>`).join('');
    const colorButtons = COLOR_CHOICES.map((c) => `<button type="button" data-color="${c}" style="width:28px;height:28px;border-radius:50%;background:${c};border:${c === color ? '3px solid var(--text)' : '2px solid transparent'};cursor:pointer"></button>`).join('');

    const body = `
      <div class="field"><label>Nome fondo</label><input type="text" id="fundName" value="${fund ? escapeHtml(fund.name) : ''}" placeholder="Es. Vacanze" /></div>
      <div class="field"><label>Icona</label><div style="display:flex;flex-wrap:wrap;gap:6px">${emojiButtons}</div></div>
      <div class="field"><label>Colore</label><div style="display:flex;flex-wrap:wrap;gap:8px">${colorButtons}</div></div>
      ${!fund || !fund.system ? `<div class="field"><label>Percentuale del rimanente mensile</label><input type="number" id="fundPercent" value="${fund ? fund.splitPercent : 0}" min="0" max="100" step="1" /></div>` : ''}
      <div class="field"><label>Obiettivo di risparmio (facoltativo)</label><input type="number" id="fundGoal" value="${fund && fund.goalAmount ? fund.goalAmount : ''}" min="0" step="1" placeholder="Es. 1500" /></div>
      <button class="btn btn-primary" data-action="save-fund" type="button">${isNew ? 'Crea fondo' : 'Salva modifiche'}</button>
      ${fund && !fund.system ? `<button class="btn btn-danger" data-action="delete-fund" type="button">Elimina fondo</button>` : ''}
    `;

    openModal('fundModal', isNew ? 'Nuovo fondo' : 'Modifica fondo', body, {
      onMount: (modal) => {
        let selectedEmoji = emoji;
        let selectedColor = color;
        modal.querySelectorAll('[data-emoji]').forEach((btn) => btn.addEventListener('click', () => {
          selectedEmoji = btn.dataset.emoji;
          modal.querySelectorAll('[data-emoji]').forEach((b) => b.style.outline = '');
          btn.style.outline = '2px solid var(--accent)';
        }));
        modal.querySelectorAll('[data-color]').forEach((btn) => btn.addEventListener('click', () => {
          selectedColor = btn.dataset.color;
          modal.querySelectorAll('[data-color]').forEach((b) => b.style.border = '2px solid transparent');
          btn.style.border = '3px solid var(--text)';
        }));

        modal.querySelector('[data-action="save-fund"]').addEventListener('click', async () => {
          const nameInput = modal.querySelector('#fundName');
          const name = nameInput.value.trim();
          if (!name) { shake(nameInput); return; }
          const percentInput = modal.querySelector('#fundPercent');
          const goalInput = modal.querySelector('#fundGoal');
          const payload = {
            id: fund ? fund.id : `fund-${uid()}`,
            name,
            emoji: selectedEmoji,
            color: selectedColor,
            goalAmount: goalInput.value ? parseFloat(goalInput.value) : null
          };
          if (percentInput) payload.splitPercent = Math.max(0, Math.min(100, parseFloat(percentInput.value) || 0));
          await Store.upsertFund(payload);
          closeModal();
          showToast(isNew ? 'Fondo creato' : 'Fondo aggiornato', name);
        });

        const deleteBtn = modal.querySelector('[data-action="delete-fund"]');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async () => {
            if (!confirm(`Eliminare "${fund.name}"? Il saldo verrà rimosso dalle statistiche.`)) return;
            await Store.removeFund(fund.id);
            closeModal();
          });
        }
      }
    });
  }

  boot();
})();
