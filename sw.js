/* Blinkears service worker: lets phones install the site as an app.
   It never caches pages, so visitors always get the newest version of the site. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return; // everything else: browser default
  e.respondWith(fetch(r).catch(() => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Blinkears</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#140d08;color:#fff;font:700 18px system-ui;text-align:center;padding:24px">' +
    '<div><div style="font-size:54px">📡</div><p>No internet right now.<br>The Blinkears will be back when you are online!</p>' +
    '<button onclick="location.reload()" style="border:0;border-radius:999px;padding:12px 22px;font:800 16px system-ui;background:#ffb347;color:#2a1206">Try again</button></div>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
