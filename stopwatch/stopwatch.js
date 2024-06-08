(function() {
    let trackedAction = [];
    let trackedActionSavingID = null; // this is for automated saving of the trackedAction
    let watchPositionID = null; // this is for automated position tracking
    let animationId = null; //this is for time display updates

    // This is a list of logging events
    const trackingEvents = {
        START: 'start',
        CONTINUE: 'continue',
        PAUSE: 'pause',
        STOP: 'stop',
        LAPTIME: 'laptime',
        POSITIONLOG: 'positionlog'
    }

    // access localStorage

    const setAppSettings = (obj = null) => {
        if (obj === null) {
            localStorage.removeItem('appSettings');
            return;
        }
        localStorage.setItem('appSettings', JSON.stringify(obj));
    }
    const getAppSettings = () => {
        return (localStorage.getItem('appSettings')) ? JSON.parse(localStorage.getItem('appSettings')) : null;
    }

    const setAppState = (obj = null) => {
        if (obj === null) {
            localStorage.removeItem('appState');
            return;
        }
        localStorage.setItem('appState', JSON.stringify(obj));
    }
    const getAppState = () => {
        return (localStorage.getItem('appState')) ? JSON.parse(localStorage.getItem('appState')) : null;
    }

    const setTrackedAction = (obj = null) => {
        if (obj === null) {
            localStorage.removeItem('trackedAction');
            return;
        }
        localStorage.setItem('trackedAction', JSON.stringify(obj));
    }
    const getTrackedAction = () => {
        return (localStorage.getItem('trackedAction')) ? JSON.parse(localStorage.getItem('trackedAction')) : null;
    }

    const setDefaultSettings = () => {
        if (!getAppSettings()) {
            setAppSettings({ useLocation: false, useTracking: false});
        }
    }
    const setDefaultState = () => {
        if (!getAppState()) {
            setAppState({ startTime:  1717750412941 });
        }
    }
    const setDefaultTrackingAction = () => {
        if (!getTrackedAction()) {
            setTrackedAction([]);
        }
    }

    // set Defaults

    setDefaultSettings();
    // setDefaultState();
    setDefaultTrackingAction();


    /**
     * This returns the latest event tracking object that meets the conditions starting at the provided index, so could be that already the object at the provided index meets the conditions
     * @param {string|Array|null} trackingEvent The event that we want to query for, could also be an array of events or null if we want to query for the latest event
     * @param {number|null} index The index to start from. If not specified, the search starts from the last index of the trackedAction array
     * @returns object with index of the found event and the found object. If nothing is found the dataObject property of the returned object is null
     */
    const getLastTrackingObject = (trackingEvent = null, index = null) => {
        if (typeof trackingEvent === 'string') {
            trackingEvent = [trackingEvent];
        }
        let start = trackedAction.length - 1;
        if (index !== null) {
            start = index ;
        }
        if (trackingEvent === null || trackingEvent.length === 0) {
            let obj = {index: start, dataObject: trackedAction[start] ?? null};
            return obj;
        }
        for (let i = start; i >= 0; i--) {
            if (trackingEvent.includes(trackedAction[i].event)) {
                let obj = {index: i, dataObject: trackedAction[i]};
                return obj;
            }
        }
        return {index: start, dataObject:  null};
    }
    yolo3 = getLastTrackingObject;

    /**
     * This returns the latest previous event tracking object that meets the conditions
     * @param {string|Array|null} trackingEvent The event that we want to query for, could also be an array of events or null if we want to query for the previous event no matter what type it is
     * @param {number|null} index The index to start from. If not specified, the search starts from the last index of the trackedAction array
     * @returns object with index of the found event and the fond object. If nothing is found the dataObject property of the returned object is null
     */
    const getPreviousTrackingObject = (trackingEvent = null, index = null) => {
        let start = trackedAction.length - 2;
        if (index !== null) {
            start = index -1;
        }
        return getLastTrackingObject(trackingEvent, start);
    }
    yolo4 = getPreviousTrackingObject;

    /**
     * 
     * @param {string|Array} trackingEvent The event that we want to query for, could also be an array of events
     * @returns array all racking event objects that meet the specified events
     */
    const filterTrackingObjectWithSpecifiedEvent = (trackingEvent) => {
        if (typeof trackingEvent === 'string') {
            trackingEvent = [trackingEvent];
        }
        let fA = trackedAction.filter((elm) => {
            return trackingEvent.includes(elm.event);
        })
        return fA;
    }
    yolo1 = filterTrackingObjectWithSpecifiedEvent;

    /**
     * This returns the total elapsed time
     * @param {object} dataObject tracking event. This is the reference event to which the time should be measured.
     * @returns object with milliseconds and formatted time with the time difference between the dataObject and the first tracking event (start)
     */
    const getTotalElapsedTime = (dataObject = null) => {
        let referenceObject = dataObject ?? trackedAction[trackedAction.length - 1];
        let milliseconds = referenceObject.timestamp - trackedAction[0].timestamp;
        return {
            milliseconds: milliseconds,
            formattetdTime: formatTime(milliseconds)
        };
    }

    /**
     * This returns the time since the specified previous tracking event
     * @param {string|array|null} trackingEvent 
     * @param {object|null} dataObject tracking event. This is the reference event to which the time should be measured. If specified the search starts from this tracking event's predecessor on backwards, if not specified the search startsfrom the last tracking event's predecessor
     * @returns object with milliseconds and formatted time with the time difference between the dataObject and the latest tracking event with the specified evnt.
     */
    const getTimeSincePreviousEvent = (trackingEvent = null, dataObject = null) => {
        let referenceObject = dataObject ?? trackedAction[trackedAction.length - 1];
        // in case index would be below 0 (when dataObject ist first object) we set the index to 1 (and thus return the start object) 
        let previousObject = getPreviousTrackingObject(trackingEvent, Math.max(trackedAction.indexOf(referenceObject), 1));
        // in case we do not find an object that meets the conditions then we take the start object
        if (!previousObject.dataObject) {
            previousObject = { index:0, dataObject: trackedAction[0] };
        }
        let milliseconds = referenceObject.timestamp - previousObject.dataObject.timestamp;
        return {
            milliseconds: milliseconds,
            formattetdTime: formatTime(milliseconds)
        };
    }

    /**
     * 
     * @returns current state by querying the trackedAction for the last entry with a valid state (so excluding position tarcking events)
     */
    const getCurrentState = () => {
        for (let i = trackedAction.length - 1; i >= 0; i--) {
            if ([
                trackingEvents.START,
                trackingEvents.CONTINUE,
                trackingEvents.PAUSE,
                trackingEvents.STOP,
                trackingEvents.LAPTIME
                ].includes(trackedAction[i].event)){
                return trackedAction[i].event;
            }
        }
        return null;
    }

    /**
     * This saves the current track regularly to the localStorage
     * We cannot save directly to the localStorge as we might have location data enabled
     * This would be retrieved asynchronously and than added to the appropriate dataObject
     * The reference to the data object would get lost if we would serialize afte rinitial creation
     * and then deserialize to dd location data nd aftr that serializing again
     * So we work on a permanent object but serialize it ever five seconds to the local Storage
     */
    const startTrackedActionSavingInterval = () => {
        trackedActionSavingID = setInterval(() => {
            console.log('autosave')
            setTrackedAction(trackedAction);
        }, 5000);
    }

    /**
     * clear the perioicvally saving, i. e. if logging is paused or stopped
     */
    const stopTrackedActionSavingInterval = () => {
        clearInterval(trackedActionSavingID);
    }

    /**
     * 
     * @param {object} dataObject This is 
     * This gets the current position and adds the data to the provided dataObject
     */
    const getCurrentPosition = (dataObject) => {
        if (myGeo) {
            myGeo.getCurrentPosition((position) => {
                addPositionDataToTrackingEvent(dataObject, position);
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

    /**
     * This fakes getting the current position and adds the data to the provided dataObject
     * @param {object} dataObject The object that is giong to be enriched with positioning data
     */
    const fakeGetCurrentPosition = (dataObject) => {
        setTimeout( () => {
            addPositionDataToTrackingEvent(dataObject, { coords: {
                latitude: 2,
                longitude: 3,
                accuracy: 0.6,
                speed: 20,
                heading: 63,
                altitude: 4,
                altitudeAccuracy: 0.7
            }});
        }, 1000);
    }

    // this is only for debugging purpose
    const displayState = () => {
        divState.textContent = getCurrentState();
    }

    /**
     * This creates a new tracking event
     * @param {string} trackingEvent The event the tracking object is being generated
     * @returns tracking event
     */
    const createDataObject = (trackingEvent) => {
        let timestamp = Date.now();
        let dataObject = {
            event: trackingEvent,
            timestamp: timestamp
        };
        if (getAppSettings().useLocation) {
            // getCurrentPosition(dataObject);
            fakeGetCurrentPosition(dataObject);
        }
        return dataObject;
    }

    /**
     * This adds a tracking event to the tracked action
     * @param {string} trackingEvent This is the event what the tracking is for
     * @param {object} dataObj This is an optional parameter. if set the tracking object would not be created but provided
     * @returns  tracking event
     */
    const addDataObject = (trackingEvent, dataObj = null) => {
        let dataObject = (dataObj) ? dataObj : createDataObject(trackingEvent);
        trackedAction.push(dataObject);
        addTimingDataToTrackingEvent(dataObject);
        setTrackedAction(trackedAction);
        return dataObject;
    }

    // let startTime = null;
    // let lastPausedTime = null;
    // let lastLapTime = null;
    // let totalPausedTime = 0;
    // let timeAndDistnceTracking = true;

    // references to dom objects
    const modalSettings =  document.querySelector('.modal-settings');
    const bOpenSettings = document.querySelector('button[data-action="open-settings"]');
    const bUseLocation = document.querySelector('input[data-action="use-location"]');
    const bUseTracking = document.querySelector('input[data-action="use-tracking"]');
    const bCloseSettings = document.querySelector('button[data-action="close-settings"]');

    const bLogLapTime = document.querySelector('button[data-action="log-lap-time"]');
    const bStartPauseContinue = document.querySelector('button[data-action="start-pause-continue"]');
    const bStop = document.querySelector('button[data-action="stop"]');
    const totalTimeDisplay = document.querySelector('.total-time');
    const lapTimeDisplay = document.querySelector('.lap-time');
    const tbl = document.querySelector('.tbl');
    const divState = document.querySelector('.state');

    let myGeo = null;

    if ("geolocation" in navigator) {
        myGeo = navigator.geolocation;
    } else {
        console.log('Geo location is not available');
    }

    /**
     * This method assigns positioning data to an tracking event object
     * @param {object} dataObject The data object the postion data should be assigned to
     * @param {object} position An objerct with position data as is returned by the geolocation api
     */
    const addPositionDataToTrackingEvent = (dataObject, position) => {
        dataObject.latitude = position.coords.latitude;
        dataObject.longitude = position.coords.longitude;
        dataObject.accuracy = position.coords.accuracy;
        dataObject.speed = position.coords.speed;
        dataObject.heading = position.coords.heading;
        dataObject.altitude = position.coords.altitude;
        dataObject.altitudeAccuracy = position.coords.altitudeAccuracy;
        setTrackedAction(trackedAction);

    }

    /**
     * This method assigns timing data to an tracking event object
     * @param {object} dataObject The data object the postion data should be assigned to
     */
    const addTimingDataToTrackingEvent = (dataObject) => {
        // total time since start of the tracking
        let totalElapsedTime = getTotalElapsedTime(dataObject);
        dataObject.totalElapsedTime = totalElapsedTime.milliseconds;
        dataObject.fTotalElapsedTime = totalElapsedTime.formattetdTime;

        // time since last tracking event (including positionlog events)
        let = timeSincePreviousEvent = getTimeSincePreviousEvent(null, dataObject);
        dataObject.timeSincePreviousEvent = timeSincePreviousEvent.milliseconds;
        dataObject.fTimeSincePreviousEvent = timeSincePreviousEvent.formattetdTime;

        // time since last real tracking event (excluding positionlog events)
        let lastTrackingObjectWithSpecifiedEvent = getTimeSincePreviousEvent([
            trackingEvents.START,
            trackingEvents.CONTINUE,
            trackingEvents.PAUSE,
            trackingEvents.STOP,
            trackingEvents.LAPTIME
        ], dataObject);
        dataObject.timeSinceLastRealEvent = lastTrackingObjectWithSpecifiedEvent.milliseconds;
        dataObject.fTimeSinceLastRealEvent = lastTrackingObjectWithSpecifiedEvent.formattetdTime;
    }

    // settings function
    const setLocation = () => {
        let appSettings = getAppSettings();
        appSettings.useLocation = true;
        bUseTracking.disabled = false;
        setAppSettings(appSettings);
    }
    const unsetLocation = () => {
        let appSettings = getAppSettings();
        appSettings.useLocation = false;
        bUseTracking.disabled = true;
        bUseTracking.checked = false;
        setAppSettings(appSettings);
        unsetTracking();
    }
    const setTracking = () => {
        let appSettings = getAppSettings();
        appSettings.useTracking = true;
        setAppSettings(appSettings);
    }
    const unsetTracking = () => {
        let appSettings = getAppSettings();
        appSettings.useTracking = false;
        setAppSettings(appSettings);
    }

    // save into LocalStorage
    const addToLocalStorage = (newAction) => {
        let trackedActions = localStorage.getItem('trackedActions') ? JSON.parse(localStorage.getItem('trackedActions')) : [];
        trackedActions.push(newAction);
        localStorage.setItem('trackedActions', JSON.stringify(trackedActions));
        return newAction;
    }
    // save data to server
    const postData = (newAction) => {
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
    const saveAction = () => {
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
    const getElapsedTime = () => {
        let n = Date.now();
        return {
            totalElapsedTime: n - startTime,
            netElapsedTime: (n - startTime) - totalPausedTime,
            lastLapTime: n - lastLapTime,
            netLastLapTime: (n - lastLapTime) - totalPausedTime,
        }
    }
    
    /**
     * 
     * @param {*} time 
     * @returns formatted time string hh:mm:ss,ff
     */
    window.formatTime = (time) => {
        let mili = (Math.floor(time/10))%100;
        let strMili = mili.toString().padStart(2, 0);
        let sec = Math.floor(time/1000)%60;
        let strSec = sec.toString().padStart(2, 0);
        let min = Math.floor(time/60000)%60;
        let strMin = min.toString().padStart(2, 0);
        let hour = Math.floor(time/3600000);
        let strHour = hour.toString().padStart(2, 0);
        return `${strHour}:${strMin}:${strSec},${strMili}`;
    }

    const updateGui = () => {
        let elapsedTimes = getElapsedTime();
        let netElapsedTimeFormatted = formatTime(elapsedTimes.netElapsedTime);
        let lastLapTimeFormatted = formatTime(elapsedTimes.lastLapTime);
        totalTimeDisplay.innerHTML = netElapsedTimeFormatted;
        lapTimeDisplay.innerHTML = lastLapTimeFormatted;
        animationId = requestAnimationFrame(function() { updateGui() });
    } 

    const updateApp = (val = null) => {
        const state = (val) ? val : getCurrentState();
        displayState();
        switch (state) {
            case trackingEvents.START:
            case trackingEvents.CONTINUE:
                console.log('sc');
                bStartPauseContinue.removeEventListener('click', fStartContinue);
                bStartPauseContinue.addEventListener('click', fPause);
                bStop.style.display = '';
                bLogLapTime.disabled = false;
                bStartPauseContinue.textContent = 'Pause';
                break;
            case trackingEvents.PAUSE:
                console.log('p');
                bStartPauseContinue.removeEventListener('click', fPause);
                bStartPauseContinue.addEventListener('click', fStartContinue);
                bStop.style.display = 'block';
                bLogLapTime.disabled = true;
                bStartPauseContinue.textContent = 'Continue';
                break;
            case trackingEvents.STOP:
                console.log('st');
                break;
            case trackingEvents.LAPTIME:
                console.log('lt');
                break;
        }
        return state;
    }
    yolo2 = updateApp;

    const watchPosition = () => {
        if (myGeo) {
            watchPositionID = myGeo.watchPosition((position) => {
                let newDataObject = {
                    event: trackingEvents.POSITIONLOG,
                    timestamp: Date.now()
                };
                addPositionDataToTrackingEvent(newDataObject, position);
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

    const fakeWatchPosition = () => {
        let watchPositionID = setInterval(() => {
            let dataObject = addDataObject(trackingEvents.POSITIONLOG);
            addPositionDataToTrackingEvent(dataObject, { coords: {
                latitude: 2,
                longitude: 3,
                accuracy: 0.6,
                speed: 20,
                heading: 63,
                altitude: 4,
                altitudeAccuracy: 0.7
            }});
        }, 4000);
    }

    // event handler methods for setting controls
    const fToggleLocationUsage = (e) => {
        let button = e.target;
        if (button.checked) {
            setLocation();
        }
        else {
            unsetLocation();
        }
    }
    const fToggleTrackingUsage = (e) => {
        let button = e.target;
        if (button.checked) {
            setTracking();
        }
        else {
            unsetTracking();
        }
    }
    const fCloseSettings = () => {
        modalSettings.style.display = '';
    }
    const fOpenSettings = () => {
        modalSettings.style.display = 'grid';
    }

    // event handler methods for app controls
    const fStartContinue = (e) => {
        addDataObject((trackedAction.length === 0) ? trackingEvents.START : trackingEvents.CONTINUE);
        if (getCurrentState() === 'start') {
            startTrackedActionSavingInterval();
            if (getAppSettings().useTracking) {
                fakeWatchPosition();
            }
        }
        updateApp();
    }
    const fPause = (e) => {
        addDataObject(trackingEvents.PAUSE);
        updateApp();
    }
    const fStop = (e) => {
        bLogLapTime.disabled = true;
        bStartPauseContinue.textContent = 'Start';
        e.target.style.display = '';
        let lastDataObject = getLastTrackingObject('pause');
        trackedAction.splice(lastDataObject.index);
        lastDataObject.dataObject.event = trackingEvents.STOP;
        addDataObject(trackingEvents.STOP, lastDataObject.dataObject);
        updateApp();
    }
    const fLogLapTime = (e) => {
        addDataObject(trackingEvents.LAPTIME);
        updateApp();
    }

    // register eventListeners
    // eventListeners for setting controls
    bOpenSettings.addEventListener('click', fOpenSettings);
    bCloseSettings.addEventListener('click', fCloseSettings);
    bUseLocation.addEventListener('click', fToggleLocationUsage);
    bUseTracking.addEventListener('click', fToggleTrackingUsage);

    // eventListeners for app controls
    bStartPauseContinue.addEventListener('click', fStartContinue);
    bLogLapTime.addEventListener('click', fLogLapTime);
    bStop.addEventListener('click', fStop);
})();