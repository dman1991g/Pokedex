const CACHE_NAME = 'pokedex-full-cache-v2'; // Update versioning to reflect full cache setup
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Array of all Pokémon IDs from 1 to 1010
const allPokemonIds = Array.from({ length: 1010 }, (_, i) => i + 1);

// Install event - cache all required files and Pokémon data
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Cache essential app files
            await cache.addAll(FILES_TO_CACHE);

            // Cache all Pokémon data in batches of 50 to avoid overwhelming the API
            for (let i = 0; i < allPokemonIds.length; i += 50) {
                const batch = allPokemonIds.slice(i, i + 50);
                const pokemonPromises = batch.map(id =>
                    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(response => {
                        if (response.ok) {
                            return cache.put(`https://pokeapi.co/api/v2/pokemon/${id}`, response);
                        }
                    })
                );
                await Promise.all(pokemonPromises);
            }
        })
    );
    self.skipWaiting(); // Activate service worker immediately after install
});

// Activate event - clear old caches if there’s an updated version
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Delete old caches
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all clients immediately
});

// Fetch event - serve from cache first, then network fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                // Cache API responses dynamically if they’re from PokéAPI
                if (event.request.url.includes('pokeapi.co')) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // Optional: handle offline error, like showing a fallback page
        })
    );
});