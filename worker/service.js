console.log('me');

self.addEventListener('install', function(event) {
    console.log('install');
});

// Activate 
self.addEventListener('activate', function(event) {
    console.log('activate');
});

self.addEventListener('fetch', function(event) {
    if (event.request.url === 'https://store.manshardt.de/worker/index.html') {
        console.log('fetch INDEX', event.request.url);
    }
    else {
        console.log('fetch OTHERS', event.request.url);
    }
    event.respondWith(
        //caches.match(event.request);
    );
});