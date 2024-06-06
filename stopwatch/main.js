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
const loggingStates = {
    START: 'start',
    COINTINUE: 'continue',
    PAUSE: 'pause',
    STOP: 'stop',
    LAPTIME: 'laptime',
    TRACKLOG: 'tracklog'
}

let startTime = null;
let lastPausedTime = null;
let lastLapTime = null;
let totalPausedTime = 0;
let times = [];
let state = null;
let cWID = null; //clearWatchId
let timeAndDistnceTracking = true;
let animationId = null;

// references to dom objects
let bLogLapTime = document.querySelector('button[data-action="log-lap-time"]');
let bStartPausdeContinue = document.querySelector('button[data-action="start-pause-continue"]');
let bStop = document.querySelector('button[data-action="stop"]');
let totalTimeDisplay = document.querySelector('.total-time');
let lapTimeDisplay = document.querySelector('.lap-time');
let tbl = document.querySelector('.tbl');

let myGeo = null;

if ("geolocation" in navigator) {
    myGeo = navigator.geolocation;
} else {
    console.log('Geo location is not available');
}

const getCurrentPosition = (dataObject) => {
    if (myGeo) {
        myGeo.getCurrentPosition((position) => {
            mapData(dataObject, position);
        },(error) => {
            console.log(error)
        },
        {
            maximumAge: 2000,
            timeout: Infinity,
            enableHighAccuracy: true,
        }
        );
    }
}
const watchPosition = () => {
    if (myGeo) {
        cWID = myGeo.watchPosition((position) => {
            let newDataObject = {
                event: loggingStates.TRACKLOG,
                timestamp: Date.now()
            };
            mapData(newDataObject, position);
            times.push(newDataObject);
        },(error) => {
            console.log(error)
        },
        {
            maximumAge: 2000,
            timeout: Infinity,
            enableHighAccuracy: true,
        }
        );
    }
}
const mapData = (dataObject, position) => {
    dataObject.latitude = position.coords.latitude;
    dataObject.longitude = position.coords.longitude;
    dataObject.accuracy = position.coords.accuracy;
    dataObject.speed = position.coords.speed;
    dataObject.heading = position.coords.heading;
    dataObject.altitude = position.coords.altitude;
    dataObject.altitudeAccuracy = position.coords.altitudeAccuracy;
}

// event handler methods
let fStartContinue = (e) => {
    bStartPausdeContinue.removeEventListener('click', fStartContinue);
    bStartPausdeContinue.addEventListener('click', fPause);
    bStop.style.display = '';
    bLogLapTime.disabled = false;
    e.target.textContent = 'Pause';
    let newDataObject = {
        event: (state === null) ? loggingStates.START : loggingStates.COINTINUE,
        timestamp: Date.now()
    };
    getCurrentPosition(newDataObject);
    times.push(newDataObject);
    if ((state === null)) {
        startTime = lastLapTime = newDataObject.timestamp;
    }
    else {
        totalPausedTime += (newDataObject.timestamp - lastPausedTime);
    }
    if (timeAndDistnceTracking) {
        watchPosition();
    }
    state = (state === null) ? loggingStates.START : loggingStates.COINTINUE;
    updateGui();
}
let fPause = (e) => {
    bStartPausdeContinue.removeEventListener('click', fPause);
    bStartPausdeContinue.addEventListener('click', fStartContinue);
    bStop.style.display = 'block';
    bLogLapTime.disabled = true;
    e.target.textContent = 'Continue';
    let newDataObject = {
        event: loggingStates.PAUSE,
        timestamp: Date.now()
    };
    getCurrentPosition(newDataObject);
    times.push(newDataObject);
    state = loggingStates.PAUSE;
    lastPausedTime = newDataObject.timestamp;
    if (cWID !== null) myGeo.clearWatch(cWID);
    window.cancelAnimationFrame(animationId);
}
let fStop = (e) => {
    e.target.style.display = '';
    bStartPausdeContinue.innerText = 'Start';
    bLogLapTime.disabled = true;
    let lastDataObject = times[times.length - 1];
    lastDataObject.event = loggingStates.STOP;
    state = null;
    saveAction();
    if (cWID !== null) myGeo.clearWatch(cWID);
    getElapsedTime();
}
let fLogLapTime = (e) => {
    if ([loggingStates.START, loggingStates.COINTINUE].includes(state)) {
        let currentDate = Date.now();
        let newDataObject = {
            event: loggingStates.LAPTIME,
            timestamp: currentDate
        };
        lastLapTime = currentDate;
        getCurrentPosition(newDataObject);
        times.push(newDataObject);
        let laps = times.filter((d) => { return d.event === 'laptime'});
        let str = '';
        for(i = 0; i < laps.length; i++) {
            let totalTime;
            let lapTime;
            if (i === 0) {
                totalTime = formatTime(laps[i].timestamp - startTime);
                lapTime = formatTime(laps[i].timestamp - startTime);
            }
            else {
                totalTime = formatTime(laps[i].timestamp - startTime);
                lapTime = formatTime(laps[i].timestamp - laps[i-1].timestamp);
            }
            console.log(laps[i].timestamp, totalTime, lapTime);
            str += '<tr><td>' + (i + 1) +'</td><td>' + totalTime + '</td><td>' + lapTime + '</td></tr>';
        }
        tbl.innerHTML = str;
    }
}

// save into LocalStorge
let addToLocalStorage = (newAction) => {
    let trackedActions = localStorage.getItem('trackedActions') ? JSON.parse(localStorage.getItem('trackedActions')) : [];
    trackedActions.push(newAction);
    localStorage.setItem('trackedActions', JSON.stringify(trackedActions));
    return newAction;
}
// save data to server
let postData = (newAction) => {
    (async () => {
      const rawResponse = await fetch('https://stopwatch.store.manshardt.de/api.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAction)
      });
      const content = await rawResponse.text();
      console.log(content);
        times = [];
    })();
}

// save an action
let saveAction = () => {
    let name = prompt('Gib der Aktion einen Namen');
//     if (name === null)
//     {
//         return false;
//     }
    let newAction = {
        date: times[0].timestamp,
        name: 'no name',
        data: times
    };
    newAction.name = name;
    addToLocalStorage(newAction);
    postData(newAction);
    return true;
}

// updateTimeDisplays
let getElapsedTime = () => {
    let n = Date.now();
    return {
        totalElapsedTime: n - startTime,
        netElapsedTime: (n - startTime) - totalPausedTime,
        lastLapTime: n - lastLapTime,
        netLastLapTime: (n - lastLapTime) - totalPausedTime,
    }
}
let formatTime = (time) => {
    let mili = time%1000;
    let strMili = mili.toString().padStart(3, 0);
    let sec = Math.floor(time/1000)%60;
    let strSec = sec.toString().padStart(2, 0);
    let min = Math.floor(time/60000)%60;
    let strMin = min.toString().padStart(2, 0);
    let hour = Math.floor(time/3600000);
    let strHour = hour.toString().padStart(2, 0);
    return `${strHour}:${strMin}:${strSec}:${strMili}`;
}
// 1 = 1ms
// 1000 = 1s
// 60000 = 1min
// 3600000 / 1std

let updateGui = () => {
    let elapsedTimes = getElapsedTime();
    let netElapsedTimeFormatted = formatTime(elapsedTimes.netElapsedTime);
    let lastLapTimeFormatted = formatTime(elapsedTimes.lastLapTime);
    totalTimeDisplay.innerHTML = netElapsedTimeFormatted;
    lapTimeDisplay.innerHTML = lastLapTimeFormatted;
    animationId = requestAnimationFrame(function() { updateGui() });
} 


// register eventListeners
bLogLapTime.addEventListener('click', fLogLapTime);
bStartPausdeContinue.addEventListener('click', fStartContinue);
bStop.addEventListener('click', fStop);
