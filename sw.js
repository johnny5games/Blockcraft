const V='blockcraft-1.7.1-pwa-1';
const FILES=['./','index.html','style.css','pwa.css','pwa.js','game.js','three.min.js','manifest.json','apple-touch-icon.png','favicon.png','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png','three-LICENSE.txt'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cl=res.clone();caches.open(V).then(c=>c.put(e.request,cl));}return res;}).catch(()=>e.request.mode==='navigate'?caches.match('index.html'):undefined)));});
