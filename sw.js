/* Edzi offline shell. No personal fitness records or API responses are cached. */
const CACHE = 'edzi-cinematic-v7';
const ROOT = '/Edzi/';
const SHELL = [ROOT, ROOT + 'manifest.json'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Prefetch versioned JS/CSS referenced by the generated Expo HTML.
    const response = await cache.match(ROOT);
    if (response) {
      const html = await response.text();
      const urls = Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g), match => new URL(match[1], self.location.origin));
      await Promise.allSettled(urls.filter(u => u.origin===self.location.origin &&
        (u.pathname.startsWith(ROOT+'_expo/') || u.pathname.startsWith(ROOT+'assets/')))
        .map(u=>cache.add(u.href)));
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE && (k.startsWith('edzi-')||k.startsWith('edzi-ascension-shell-'))).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache=await caches.open(CACHE);
          await cache.put(ROOT,response.clone());
        }
        return response;
      } catch {
        return (await caches.match(ROOT)) || Response.error();
      }
    })());
    return;
  }
  const isStatic = url.pathname.startsWith(ROOT+'_expo/') ||
    url.pathname.startsWith(ROOT+'assets/') ||
    url.pathname.startsWith(ROOT+'icons/') ||
    url.pathname === ROOT+'manifest.json' || url.pathname === ROOT+'favicon.ico';
  if (!isStatic) return;
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok) {
      const cache=await caches.open(CACHE);
      await cache.put(request,response.clone());
    }
    return response;
  })());
});
