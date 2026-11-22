/* SQL Quest — service worker (PWA offline).
   Estratégia:
   • Arquivos do próprio app → rede primeiro (3 s), com cache como reserva: online você sempre vê a versão mais nova;
     offline (ou com internet ruim) o app abre do cache.
   • Bibliotecas do cdnjs (SQLite/sql.js, CodeMirror, JSZip) → cache primeiro: as URLs têm versão fixa, então nunca mudam.
   • Outros domínios (ex.: vídeos do YouTube) não são interceptados.
   Ao mudar arquivos do app, aumente VERSION para limpar o cache antigo. */
const VERSION = 'v1';
const CACHE = `sqlquest-${VERSION}`;
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/';

const LOCAL = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest', 'favicon.svg',
  'icons.js', 'auth.js', 'db/schema.js', 'storage.js', 'content.js', 'content_sb.js', 'content_extra.js',
  'explicacoes.js', 'videos_hc.js', 'roadmap.js', 'dashboard.js', 'lab.js', 'login.js', 'app.js', 'pwa.js',
  'assets/fonts/figtree-latin.woff2', 'assets/fonts/figtree-latin-ext.woff2',
  'assets/fonts/jetbrains-mono-latin.woff2', 'assets/fonts/jetbrains-mono-latin-ext.woff2',
  'assets/fonts/gloock-400-latin.woff2', 'assets/fonts/gloock-400-latin-ext.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];
const REMOTE = [
  'codemirror/5.65.16/codemirror.min.css', 'codemirror/5.65.16/theme/material-darker.min.css',
  'codemirror/5.65.16/codemirror.min.js', 'codemirror/5.65.16/mode/sql/sql.min.js',
  'codemirror/5.65.16/addon/edit/matchbrackets.min.js', 'codemirror/5.65.16/addon/edit/closebrackets.min.js',
  'sql.js/1.8.0/sql-wasm.js', 'sql.js/1.8.0/sql-wasm.wasm', 'jszip/3.10.1/jszip.min.js'
].map(p => CDN + p);

/* busca com CORS (resposta legível e cacheável) e guarda pela URL pura */
async function fetchCdn(url) {
  const res = await fetch(new Request(url, {mode: 'cors', credentials: 'omit'}));
  if (!res.ok) throw new Error(res.status + ' ' + url);
  const cache = await caches.open(CACHE);
  await cache.put(url, res.clone());
  return res;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    /* o app local é obrigatório; as bibliotecas externas são "melhor esforço" (instalação não falha sem elas) */
    await cache.addAll(LOCAL.map(u => new Request(u, {cache: 'reload'})));
    await Promise.allSettled(REMOTE.map(fetchCdn));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('sqlquest-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await withTimeout(fetch(req), 3000);
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req, {ignoreSearch: true});
    if (hit) return hit;
    if (req.mode === 'navigate') { const idx = await cache.match('index.html'); if (idx) return idx; }
    throw e;
  }
}

async function cacheFirstCdn(url) {
  const hit = await (await caches.open(CACHE)).match(url);
  return hit || fetchCdn(url);
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) event.respondWith(networkFirst(req));
  else if (req.url.startsWith(CDN)) event.respondWith(cacheFirstCdn(req.url));
});
