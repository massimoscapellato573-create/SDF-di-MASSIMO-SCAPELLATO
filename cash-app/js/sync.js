// Sincronizzazione tra dispositivi.
//
// Livello 1 (sempre disponibile, nessuna configurazione): esporta/importa un
// file JSON con l'intero stato — utile come backup manuale o trasferimento
// una tantum.
//
// Livello 2 (opzionale): sincronizzazione automatica in tempo reale via
// Firebase Firestore. Richiede un progetto Firebase gratuito personale
// (nessuna chiave è inclusa in questo codice). Basta incollare la
// configurazione del progetto nelle Impostazioni > Sincronizzazione e
// scegliere un "codice di coppia" uguale su entrambi i dispositivi: da quel
// momento ogni modifica si propaga automaticamente. Istruzioni complete in
// README.md. Questo livello è pensato per essere sostituito in futuro da un
// backend proprio senza toccare il resto dell'app: passa tutto da
// pushState()/applyRemoteState().
const Sync = {
  deviceId: null,
  firestore: null,
  unsubscribe: null,
  pushTimer: null,
  lastPushedVersion: 0,
  status: 'offline', // offline | connecting | connected | error

  async init() {
    this.deviceId = await DB.kvGet('deviceId');
    if (!this.deviceId) {
      this.deviceId = uid();
      await DB.kvSet('deviceId', this.deviceId);
    }
    const cfg = Store.settings.sync;
    if (cfg && cfg.enabled && cfg.config && cfg.syncCode) {
      this.connect(cfg.config, cfg.syncCode).catch((err) => {
        console.error('Sync connect failed', err);
        this.setStatus('error');
      });
    }
  },

  setStatus(status) {
    this.status = status;
    window.dispatchEvent(new CustomEvent('sync-status', { detail: { status } }));
  },

  async loadFirebaseSDK() {
    if (window.firebase && window.firebase.firestore) return;
    await Promise.all([
      loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js'),
      loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js')
    ]);
  },

  async connect(config, syncCode) {
    this.setStatus('connecting');
    await this.loadFirebaseSDK();
    if (!window.firebase.apps || !window.firebase.apps.length) {
      window.firebase.initializeApp(config);
    }
    this.firestore = window.firebase.firestore();
    const docRef = this.firestore.collection('cashSync').doc(syncCode);

    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = docRef.onSnapshot(
      (snap) => {
        this.setStatus('connected');
        if (!snap.exists) return;
        const data = snap.data();
        if (!data || data.device === this.deviceId) return;
        if ((data.version || 0) <= this.lastPushedVersion) return;
        this.applyRemoteState(data);
      },
      (err) => {
        console.error('Firestore listen error', err);
        this.setStatus('error');
      }
    );

    this.docRef = docRef;
  },

  async disconnect() {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = null;
    this.docRef = null;
    this.setStatus('offline');
  },

  notifyLocalChange() {
    if (!this.docRef) return;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.pushState().catch((e) => console.error('Sync push failed', e)), 1200);
  },

  async pushState() {
    if (!this.docRef) return;
    const version = Date.now();
    this.lastPushedVersion = version;
    const payload = this.serializeState();
    payload.version = version;
    payload.device = this.deviceId;
    await this.docRef.set(payload);
  },

  serializeState() {
    const { sync, ...settingsWithoutSync } = Store.settings;
    return {
      funds: Store.funds,
      transactions: Store.transactions,
      settings: settingsWithoutSync,
      exportedAt: new Date().toISOString()
    };
  },

  async applyRemoteState(data) {
    if (!data.funds || !data.transactions) return;
    await DB.clear('funds');
    await DB.clear('transactions');
    await DB.bulkPut('funds', data.funds);
    await DB.bulkPut('transactions', data.transactions);
    if (data.settings) {
      Store.settings = deepMergeSafe(Store.settings, data.settings);
      await DB.kvSet('settings', Store.settings);
    }
    await Store.init();
    window.dispatchEvent(new CustomEvent('sync-applied'));
  },

  exportJSON() {
    const payload = this.serializeState();
    payload.settings = Store.settings; // export completo, incluso sync config
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `contanti-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async importJSON(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.funds || !data.transactions) throw new Error('File non valido');
    await DB.clear('funds');
    await DB.clear('transactions');
    await DB.bulkPut('funds', data.funds);
    await DB.bulkPut('transactions', data.transactions);
    if (data.settings) await DB.kvSet('settings', data.settings);
    await Store.init();
  },

  randomSyncCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Impossibile caricare ${src}`));
    document.head.appendChild(s);
  });
}

function deepMergeSafe(base, override) {
  const out = { ...base };
  for (const key of Object.keys(override || {})) {
    if (
      override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) &&
      base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])
    ) {
      out[key] = deepMergeSafe(base[key], override[key]);
    } else {
      out[key] = override[key];
    }
  }
  return out;
}

window.Sync = Sync;
