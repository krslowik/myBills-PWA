const CACHE_NAME = 'rachunki-pwa-v1'
const urlsToCache = [
	'./',
	'./index.html',
	'./style.css',
	'./main.js',
	'./manifest.json',
	'./icon-192.png',
	'./icon-512.png'
]

// Install – zapisanie plików aplikacji w cache
self.addEventListener('install', event => {
	event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)))
	self.skipWaiting()
})

// Activate – usunięcie starych wersji cache
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(
				keys.map(key => {
					if (key !== CACHE_NAME) return caches.delete(key)
				})
			)
		)
	)
	self.clients.claim()
})

// Fetch – strategia cache-first (najpierw cache, potem sieć)
self.addEventListener('fetch', event => {
	event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)))
})
