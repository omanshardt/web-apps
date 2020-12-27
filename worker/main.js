// https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock
async function lockme() {
    try {
        await screen.orientation.lock('landscape');
    }
    catch(e) {
        console.log(e);
    }
}
lockme();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => { console.log('Service Worker Registered') });
}

// if ('serviceWorker' in navigator) {
//   caches.keys().then(function(cacheNames) {
//     cacheNames.forEach(function(cacheName) {
//       caches.delete(cacheName);
//     });
//   });
// }
