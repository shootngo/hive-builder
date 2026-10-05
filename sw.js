/* Frank's Hive Builder service worker — full offline shell */
const CACHE = 'hive-v1.1';
const SHELL = ['./', './index.html', './css/app.css', './js/dims.js', './js/diagrams.js', './js/cutlist.js', './js/guide.js', './js/info.js', './js/fence.js', './js/fence-guide.js', './js/db.js', './js/ui.js', './js/pages.js', './js/app.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of SHELL) { try { await c.add(new Request(u, { cache: 'reload' })); } catch (err) { console.warn('[HB SW] skip', u); } }
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('hive-')).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  e.respondWith((async () => {
    if (isHTML) {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) (await caches.open(CACHE)).put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    }
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const fresh = await fetch(req);
    if (fresh && fresh.ok) (await caches.open(CACHE)).put(req, fresh.clone());
    return fresh;
  })());
});
