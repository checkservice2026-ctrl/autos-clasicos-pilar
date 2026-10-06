// Service worker mínimo: red primero, caché como respaldo para la carcasa de la app.
const C='acp-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});
