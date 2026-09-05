// Notifiche locali: attive quando l'app è aperta o appena riaperta dopo un
// evento (es. accantonamento del fondo lavoro). Senza un server push, non
// possiamo notificare a app completamente chiusa: è un limite noto, spiegato
// nelle impostazioni.
const Notifications = {
  async requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.requestPermission();
  },

  isEnabled() {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  async notify(title, body, extra = {}) {
    if (!this.isEnabled()) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { title, body } }));
      return;
    }
    const options = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-96.png', ...extra };
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.active?.postMessage({ type: 'SHOW_NOTIFICATION', title, options });
      } else {
        new Notification(title, options);
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { title, body } }));
    }
  }
};

window.Notifications = Notifications;
