/* Orçamento da família — funcionamento sem internet.
   Ao publicar uma atualização, troque o número da VERSAO. */
const VERSAO = "orcamento-v1";
const EXTERNO = VERSAO + "-externo";
const ESSENCIAIS = [
  "./", "./index.html", "./instalar.html", "./manifest.webmanifest",
  "./icones/icone-192.png", "./icones/icone-512.png", "./icones/apple-touch-icon.png", "./icones/favicon-32.png"
];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(VERSAO).then(c => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO && n !== EXTERNO).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // as páginas: tenta a rede (para pegar atualizações) e cai no que está guardado
  if (req.mode === "navigate"){
    const pagina = /instalar\.html$/.test(url.pathname) ? "./instalar.html" : "./index.html";
    ev.respondWith(
      fetch(req).then(r => {
        if (r.ok){ const copia = r.clone(); caches.open(VERSAO).then(c => c.put(pagina, copia)); }
        return r;
      }).catch(() => caches.match(pagina))
    );
    return;
  }

  // arquivos do próprio app: o guardado primeiro
  if (url.origin === location.origin){
    ev.respondWith(caches.match(req).then(g => g || fetch(req).then(r => {
      if (r.ok){ const copia = r.clone(); caches.open(VERSAO).then(c => c.put(req, copia)); }
      return r;
    })));
    return;
  }

  // fontes e módulos do Firebase: usa o guardado e atualiza por trás
  const externo = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"
    || (url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/"));
  if (externo){
    ev.respondWith(caches.open(EXTERNO).then(c => c.match(req).then(g => {
      const rede = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => g);
      return g || rede;
    })));
  }
  // o resto (Firestore, login, agenda do Google) vai direto para a rede
});
