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

//

let times = [];
let state = null;

let bTimeLog = document.querySelector('button[data-action="log-time"]');
let bStartPausdeContinue = document.querySelector('button[data-action="start-pause-continue"]');
let bStop = document.querySelector('button[data-action="stop"]');

let fStartContinue = (e) => {
    console.log('start');
    bStartPausdeContinue.removeEventListener('click', fStartContinue);
    bStartPausdeContinue.addEventListener('click', fPause);
    bStop.style.display = '';
    bTimeLog.disabled = false;
    e.target.textContent = 'Pause';
    times.push({
        event: (state === null) ? 'start' : 'continue',
        timestamp: new Date()
    });
    state = (state === null) ? 'started' : 'continuing';
    console.log(times);
}
let fPause = (e) => {
    console.log('pause');
    bStartPausdeContinue.removeEventListener('click', fPause);
    bStartPausdeContinue.addEventListener('click', fStartContinue);
    bStop.style.display = 'block';
    bTimeLog.disabled = true;
    e.target.textContent = 'Continue';
    times.push({
        event: 'pause',
        timestamp: new Date()
    });
    state = 'paused';
    console.log(times);
}
let fStop = (e) => {
    e.target.style.display = '';
    bStartPausdeContinue.innerText = 'Start';
    bTimeLog.disabled = true;
    times.push({
        event: 'stop',
        timestamp: new Date()
    });
    state = null;
    console.log(times);
    times = [];
}
let fLogTime = (e) => {
    if (['started', 'continuing'].includes(state)) {
        times.push({
            event: 'log time',
            timestamp: new Date()
        });
    }
}

bTimeLog.addEventListener('click', fLogTime);
bStartPausdeContinue.addEventListener('click', fStartContinue);
bStop.addEventListener('click', fStop);
