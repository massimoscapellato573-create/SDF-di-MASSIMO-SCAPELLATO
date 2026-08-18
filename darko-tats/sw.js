// Service worker per le notifiche push del pannello di Pietro.
// Non serve per il resto del sito: si occupa solo di ricevere le notifiche
// e aprire il pannello quando vengono toccate.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}

  const title = data.title || 'darko.tats';
  const options = {
    body: data.body || 'Hai una nuova notifica.',
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/icon-192.png',
    data: { url: data.url || '/admin.html' },
    vibrate: [120, 60, 120]
  };

  const tasks = [self.registration.showNotification(title, options)];
  if ('setAppBadge' in self.registration && typeof data.badgeCount === 'number') {
    tasks.push(
      data.badgeCount > 0
        ? self.registration.setAppBadge(data.badgeCount).catch(() => {})
        : self.registration.clearAppBadge().catch(() => {})
    );
  }
  event.waitUntil(Promise.all(tasks));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/admin.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('admin.html') && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
