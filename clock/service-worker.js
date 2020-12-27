self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('my-cache').then(function(cache) {
     return cache.addAll([
      'main.js',
      'index.html',
      'components/uic-clock.js',
      "res/art/icons/android-chrome-192x192.png",
      "res/art/icons/android-chrome-512x512.png",
      "res/art/icons/apple-touch-icon.png",
      "res/art/icons/browserconfig.xml",
      "res/art/icons/favicon-16x16.png",
      "res/art/icons/favicon-32x32.png",
      "res/art/icons/favicon.ico",
      "res/art/icons/mstile-150x150.png",
      "res/art/icons/safari-pinned-tab.svg"
    ]);
   })
 );
});

self.addEventListener('fetch', function(e) {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
