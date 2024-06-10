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
            <div class="_label">bis zum Mittag:</div>
            <div style="display:flex">
                <div id="remainingHoursLunch"></div>
                <div id="colonLunch">:</div>
                <div id="remainingMinutesLunch" style="display:flex; align-itens:center"></div>
            </div>
        </div>
        <div class="wrapper" style="margin:12px 0px; display:flex; gap:16px; align-items:center">
            <div class="_label">bis zum 16:00 Uhr-Spaziergang:</div>
            <div style="display:flex">
                <div id="remainingHoursCoffee"></div>
                <div id="colonCoffee">:</div>
                <div id="remainingMinutesCoffee"></div>
            </div>
        </div>
        <div class="wrapper" style="margin:12px 0px; display:flex; gap:16px; align-items:center">
            <div class="_label">bis zum Feierabend:</div>
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

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (newValue !== oldValue) {
            this[attrName] = this.hasAttribute(attrName);
        }
    }

    connectedCallback() {
        //this.doClock(this);
        this.writeRemainingTime({
            hour:12,
            remainingHours: 'remainingHoursLunch',
            remainingMinutes: 'remainingMinutesLunch',
            colon:'colonLunch'
        });
        this.writeRemainingTime({
            hour:16,
            remainingHours: 'remainingHoursCoffee',
            remainingMinutes: 'remainingMinutesCoffee',
            colon:'colonCoffee'
        });
        this.writeRemainingTime({
            hour:18,
            remainingHours: 'remainingHours',
            remainingMinutes: 'remainingMinutes',
            colon:'colon'
        });
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
