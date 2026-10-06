JS
// Service worker mínimo: permite instalar la app. No guarda caché, siempre usa la versión más nueva.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request))});
 
