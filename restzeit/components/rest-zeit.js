/**
 * rest-zeit 1.1
 * Release date: 2020-06-13
 */

class restZeit extends HTMLElement {
    constructor() {
        super();
        this.remainingHours = [];
        this.remainingMinutes = [];

        this.sr = this.attachShadow({ mode: 'open' });
        this.sr.innerHTML = `
        <div style="padding-bottom:8vh; display:flex; justify-content:center; left:0; top:0; right:0; bottom:0; font-size:28vw; opacity:0.045; position:absolute; z-index:1; display:flex; gap:16px; align-items:center">
            Restzeit
        </div>
        <div class="wrapper" style="position:relative; z-index:10; margin:12px 0px; display:flex; gap:16px; align-items:center">
            <div class="_label label-lunch">bis zum Mittag:</div>
            <div style="display:flex">
                <div id="remainingHoursLunch"></div>
                <div id="colonLunch">:</div>
                <div id="remainingMinutesLunch" style="display:flex; align-itens:center"></div>
            </div>
        </div>
        <div class="wrapper" style="margin:12px 0px; display:flex; gap:16px; align-items:center">
            <div class="_label label-afternoon"">bis zum 16:00 Uhr-Spaziergang:</div>
            <div style="display:flex">
                <div id="remainingHoursCoffee"></div>
                <div id="colonCoffee">:</div>
                <div id="remainingMinutesCoffee"></div>
            </div>
        </div>
        <div class="wrapper" style="margin:12px 0px; display:flex; gap:16px; align-items:center">
            <div class="_label label-evening">bis zum Feierabend:</div>
            <div style="display:flex">
                <div id="remainingHours"></div>
                <div id="colon">:</div>
                <div id="remainingMinutes" style="display:flex; align-itens:center"></div>
            </div>
        </div>
<style>
/*
.wrapper > * {border:1px solid red}
*/
._label {opacity:0.4}
</style>
`;
    }

    set lunch(lunch) {
        if (!lunch) {
            this.removeAttribute('lunch');
        } else {
            this.setAttribute('lunch', lunch);
        }
    }
    get lunch() {
        return this.getAttribute('lunch');
    }

    set afternoon(afternoon) {
        if (!afternoon) {
            this.removeAttribute('afternoon');
        } else {
            this.setAttribute('afternoon', afternoon);
        }
    }
    get afternoon() {
        return this.getAttribute('afternoon');
    }

    set evening(evening) {
        if (!evening) {
            this.removeAttribute('evening');
        } else {
            this.setAttribute('evening', evening);
        }
    }
    get evening() {
        return this.getAttribute('evening');
    }

    set lunchText(lunchText) {
        if (!lunchText) {
            this.removeAttribute('lunch-text');
        } else {
            this.setAttribute('lunch-text', lunchText);
        }
    }
    get lunchText() {
        return this.getAttribute('lunch-text');
    }

    set afternoonText(afternoonText) {
        if (!afternoonText) {
            this.removeAttribute('afternoon-text');
        } else {
            this.setAttribute('afternoon-text', afternoonText);
        }
    }
    get afternoonText() {
        return this.getAttribute('afternoon-text');
    }

    set eveningText(eveningText) {
        if (!eveningText) {
            this.removeAttribute('evening-text');
        } else {
            this.setAttribute('evening-text', eveningText);
        }
    }
    get eveningText() {
        return this.getAttribute('evening-text');
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        switch(attrName) {
            case 'lunch':
                this.dataLunch.hour = newValue;
                break;
            case 'afternoon':
                this.dataAfternoon.hour = newValue;
                break;
            case 'evening':
                this.dataEvening.hour = newValue;
                break;
            case 'lunch-text':
                this.shadowRoot.querySelector('.label-lunch').textContent = newValue;
                break;
            case 'afternoon-text':
                this.shadowRoot.querySelector('.label-afternoon').textContent = newValue;
                break;
            case 'evening-text':
                this.shadowRoot.querySelector('.label-evening').textContent = newValue;
                break;
            }
    }

    dataLunch = {}
    dataAfternoon = {}
    dataEvening = {}
    

    connectedCallback() {
        this.dataLunch = {
            hour: this.lunch ?? 12,
            remainingHours: 'remainingHoursLunch',
            remainingMinutes: 'remainingMinutesLunch',
            colon:'colonLunch'
        }
        this.dataAfternoon = {hour:this.afternoon ?? 16,
            remainingHours: 'remainingHoursCoffee',
            remainingMinutes: 'remainingMinutesCoffee',
            colon:'colonCoffee'
        }
        this.dataEvening = {
            hour:this.evening ?? 18,
            remainingHours: 'remainingHours',
            remainingMinutes: 'remainingMinutes',
            colon:'colon'
        }
        this.writeRemainingTime(this.dataLunch);
        this.writeRemainingTime(this.dataAfternoon);
        this.writeRemainingTime(this.dataEvening);
    }

    static get observedAttributes() {
        return ['lunch', 'afternoon', 'evening', 'lunch-text', 'afternoon-text', 'evening-text'];
    }

    writeRemainingTime(options){
        var obj = this;
        var currentTime = new Date(new Date().setSeconds(0)).setMilliseconds(0);
        var closingTime = (new Date()).setHours(options.hour, 0, 0, 0);
        var remainingHours = Math.floor((closingTime - currentTime) / 3600000);
        var remainingMinutes = Math.ceil(((closingTime - currentTime) % 3600000) / 60000);
        remainingMinutes = (remainingMinutes < 10) ? '0' + remainingMinutes : remainingMinutes;
            if (!obj.remainingHours[options.colon] || (obj.remainingHours[options.colon] && remainingHours !== obj.remainingHours[options.colon])) {
                obj.sr.getElementById(options.remainingHours).innerHTML = (remainingHours > 0 || (remainingHours == 0 && remainingMinutes > 0)) ? remainingHours : '' ;
                obj.remainingHours[options.colon] = remainingHours;
            }
            if (!obj.remainingMinutes[options.colon] || (obj.remainingMinutes[options.colon] && remainingMinutes !== obj.remainingMinutes[options.colon])) {
                obj.sr.getElementById(options.remainingMinutes).innerHTML = (remainingHours > 0 || (remainingHours == 0 && remainingMinutes > 0)) ? remainingMinutes : '<img src="res/smiley-icon.svg" style="width:6vw; display:block;">' ;
                obj.remainingMinutes[options.colon] = remainingMinutes;
            }
            if (remainingHours > 0 || (remainingHours == 0 && remainingMinutes > 0)) {
                    obj.sr.getElementById(options.colon).style.visibility = 'visible';
            }
            else {
                obj.sr.getElementById(options.colon).style.visibility = 'hidden';
            }

        obj.animationId = requestAnimationFrame(function() { obj.writeRemainingTime(options) });
    }
}

customElements.define('rest-zeit', restZeit);
