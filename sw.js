const CACHE = 'forqaat-v35';
// الملفات التي تحتاجها اللعبة فقط (صورة المعاينة og-image وأيقونات ٥١٢ لا تُحمَّل مسبقًا لتوفير الباقة)
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  const nav = e.request.mode === 'navigate';
  e.respondWith(
    // فتح الصفحة يستخدم النسخة المحفوظة حتى لو أضيف للرابط ?fbclid أو غيره
    caches.match(nav ? './index.html' : e.request, { ignoreSearch: nav })
      .then(hit => hit || fetch(e.request).then(res => {
        if (res.ok && !nav) {                                // لا تُحفظ ردود الخطأ
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => nav ? caches.match('./index.html') : Response.error()))
  );
});
