// Autos Clásicos Pilar - modo sin conexión (v3)
const CACHE='acp-v3';
const SHELL=['./','index.html','manifest.json','logo.png','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
// Librerías externas que la app necesita para abrir y escanear: se guardan al instalar
const FB='https://www.gstatic.com/firebasejs/10.12.2/';
const LIBS=[FB+'firebase-app.js',FB+'firebase-auth.js',FB+'firebase-firestore.js',FB+'firebase-storage.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled([...SHELL,...LIBS].map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const save=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c)).catch(()=>{})}return res};
// Red con tiempo máximo: con señal mala no se queda esperando, usa lo guardado
const net=(r,ms)=>new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('timeout')),ms);fetch(r).then(x=>{clearTimeout(t);ok(x)},x=>{clearTimeout(t);no(x)})});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // Datos de Firebase (Firestore, Auth, Storage): no se tocan, la persistencia la maneja Firestore
  if(/googleapis\.com|firebaseio\.com|firebasestorage|identitytoolkit|securetoken/.test(u.hostname))return;
  if(u.origin===location.origin){
    // Propios: red primero (versión nueva) con 4 s de espera; si falla o no hay red, usa lo guardado
    e.respondWith(net(r,4000).then(res=>save(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))));
  }else if(/gstatic\.com|jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|fonts\./.test(u.hostname)){
    // Librerías externas con versión fija: caché primero
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>save(r,res))));
  }
});
 
