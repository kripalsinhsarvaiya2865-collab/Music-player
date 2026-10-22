const CACHE = "naitri-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || r.headers.has("range")) return;       // audio streaming goes straight to network
  const sameOrigin = u.origin === location.origin;
  const sdk = u.hostname === "www.gstatic.com";                    // Firebase SDK files
  if (!sameOrigin && !sdk) return;                                 // songs, database: never cached here
  e.respondWith(
    caches.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(r, res.clone())); return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
