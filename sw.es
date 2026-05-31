/**
 * Service Worker para Compromissos App PWA
 * Habilita funcionalidade offline e estratégias de cache
 */

const CACHE_NAME = 'compromissos-app-v1';
const RUNTIME_CACHE = 'compromissos-app-runtime-v1';

// Arquivos para cache na instalação
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

/**
 * Evento de instalação - cache de assets estáticos
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Cacheando assets estáticos');
            return cache.addAll(STATIC_ASSETS).catch((error) => {
                console.warn('[Service Worker] Falha ao cachear alguns assets:', error);
            });
        }).then(() => {
            self.skipWaiting();
        })
    );
});

/**
 * Evento de ativação - limpar caches antigos
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Ativando...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[Service Worker] Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

/**
 * Evento de fetch - implementar estratégia de cache
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Pula requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Pula extensões do Chrome
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // Estratégia cache-first para assets estáticos
    if (
        request.destination === 'image' ||
        request.destination === 'font' ||
        request.destination === 'style' ||
        request.destination === 'script'
    ) {
        event.respondWith(
            caches.match(request).then((response) => {
                if (response) {
                    return response;
                }

                return fetch(request).then((response) => {
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                }).catch(() => {
                    return caches.match(request);
                });
            })
        );
        return;
    }

    // Estratégia network-first para HTML e requisições
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            })
            .catch(() => {
                return caches.match(request).then((response) => {
                    if (response) {
                        return response;
                    }

                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }

                    return new Response('Offline - Recurso não disponível', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain',
                        }),
                    });
                });
            })
    );
});

/**
 * Manipula mensagens de clientes
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
