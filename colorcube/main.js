if ("orientation" in screen) {
  async function lockme() {
    try {
      await screen.orientation.lock('landscape');
    }
    catch(e) {
      console.log(e);
    }
  }
  lockme();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => { console.log('Service Worker Registered') });
}