/* Service worker del portafoglio.
   Tiene in cache la pagina e i caratteri, così l'app si apre anche
   senza rete e parte subito, come un'applicazione installata.
   Non tocca in nessun modo i dati: quelli stanno nel localStorage
   cifrato del telefono e non passano mai da qui. */

const CACHE = "portafoglio-v1";
const GUSCIO = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(GUSCIO))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(chiavi => Promise.all(chiavi.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* caratteri di Google: prima la cache, poi aggiorna in sottofondo */
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")){
    e.respondWith(caches.open(CACHE).then(async c => {
      const inCache = await c.match(req);
      const dallaRete = fetch(req)
        .then(r => { if (r.ok) c.put(req, r.clone()); return r; })
        .catch(() => inCache);
      return inCache || dallaRete;
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  /* la pagina: prima la rete, così un aggiornamento arriva subito;
     se manca la connessione si usa la copia salvata */
  e.respondWith(
    fetch(req)
      .then(r => {
        if (r.ok){ const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return r;
      })
      .catch(() => caches.match(req).then(m => m || caches.match("./index.html")))
  );
});
