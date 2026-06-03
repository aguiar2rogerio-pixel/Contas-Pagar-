// =================================================================
// sw.js - Versão Avançada Network-First (Sem travamento de Cache)
// =================================================================

const CACHE_NAME = 'financas-v2'; // Mudamos a versão para forçar a limpeza da anterior
const ASSETS = [
  './',
  './index.html',
  './Estilos.css',
  './app.js',
  './Cadastros.js',
  './CalculoFinanceiro.js',
  './Historico.js',
  './Telas.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Instalação: Guarda a base para funcionamento offline, mas sem bloquear a rede
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Força o novo SW a ativar-se imediatamente
  );
});

// Ativação: Limpa automaticamente qualquer lixo de caches antigos do teu telemóvel
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controlo da página na hora
  );
});

// ESTRATÉGIA INDESTRUTÍVEL: Network-First (Tenta sempre a internet primeiro)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Se a internet funcionar, clona a resposta e atualiza o cache em segundo plano
        if (response && response.status === 200 && e.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // SE A INTERNET FALHAR (OFFLINE), ele vai buscar ao chip de memória instantaneamente
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se for uma página de navegação e não houver cache, devolve a index
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

