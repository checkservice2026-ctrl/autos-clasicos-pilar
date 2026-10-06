// Autos Clásicos Pilar - modo sin conexión
const CACHE='acp-v2';
const SHELL=['./','index.html','manifest.json','logo.png','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const save=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c)).catch(()=>{})}return res};
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // Datos de Firebase (Firestore, Auth, Storage): no se tocan, la persistencia la maneja Firestore
  if(/googleapis\.com|firebaseio\.com|firebasestorage|identitytoolkit|securetoken/.test(u.hostname))return;
  if(u.origin===location.origin){
    // Propios: red primero (siempre la versión nueva), y si no hay red usa lo guardado
    e.respondWith(fetch(r).then(res=>save(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))));
  }else if(/gstatic\.com|jsdelivr\.net|unpkg\.com|fonts\./.test(u.hostname)){
    // Librerías externas con versión fija: caché primero
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>save(r,res))));
  }
});
