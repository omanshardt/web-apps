/**
 * ab-clock 1.1
 * Release date: 2020-06-13
 */

class abClock extends HTMLElement {
    static get observedAttributes() {
        return ['digital'];
    }

    constructor() {
        super();
        this._hDeg = null;
        this._mDeg = null;
        this._sDeg = null;
        this.sr = this.attachShadow({ mode: 'open' });
        this.sr.innerHTML = `<span id="clock-span" style="display:flex; align-items:center"><svg xmlns:php="http://php.net/xsl" xmlns:xlink="http://php.net/xsl" id="mb-header-svg" viewBox="0 0 260 260" version="1.1" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.5; width:1.4em; height:1.4em; vertical-align:-0.10em">
                    <g transform="matrix(0.325831,0,0,0.325831,-0.332313,9.77605)">
                        <g transform="matrix(1,0,0,1,-2938.31,37.3235)">
                            <path id="mbheartsolid" d="M3068.42,313.674C3057.18,268.572 3066.39,224.684 3088.23,188.998C3133.1,115.666 3232.17,76.582 3320.31,132.521L3320.31,313.674L3068.42,313.674ZM3356.31,313.674L3356.31,132.522C3444.44,76.581 3543.51,115.666 3588.38,188.998C3610.22,224.684 3619.43,268.572 3608.19,313.674L3356.31,313.674ZM3594.79,349.672C3588.84,361.571 3581.33,373.425 3572.12,385.109C3570.67,386.95 3389.62,569.202 3356.31,602.731L3356.31,349.672L3594.79,349.672ZM3320.31,349.672L3320.31,602.73C3286.99,569.198 3105.94,386.95 3104.49,385.109C3095.28,373.425 3087.77,361.571 3081.82,349.672L3320.31,349.672Z" style="fill:white;"/>
                        </g>
                        <g transform="matrix(1,0,0,1,-2943.83,37.3235)">
                            <path id="mbcrossoutlined" d="M3325.83,349.673L2978.83,349.673C2968.89,349.673 2960.83,341.607 2960.83,331.673C2960.83,321.739 2968.89,313.673 2978.83,313.673L3325.83,313.673L3325.83,23.405C3325.83,13.471 3333.89,5.405 3343.83,5.405C3353.76,5.405 3361.83,13.471 3361.83,23.405L3361.83,313.673L3708.83,313.673C3718.76,313.673 3726.83,321.739 3726.83,331.673C3726.83,341.607 3718.76,349.673 3708.83,349.673L3361.83,349.673L3361.83,701.948C3361.83,711.882 3353.76,719.948 3343.83,719.948C3333.89,719.948 3325.83,711.882 3325.83,701.948L3325.83,349.673Z" style="fill:none;stroke:rgb(221,221,221);stroke-width:6.14px;"/>
                        </g>
                    </g>

                    <g transform="translate(133,133)">
                        <path id="mb-s-minute" d="M0,12L0,-100" transform="rotate(30)" style="stroke: #00000066; stroke-width: 10px; display: block; stroke-linecap:round; filter:blur(4px)"/>
                    </g>

                    <g transform="translate(130,130)">
                        <path id="mb-minute" d="M0,12L0,-100" transform="rotate(30)" style="fill: none; stroke: #FFE65EDD; stroke-width: 10px; display: block; stroke-linecap:round;"/>
                    </g>


                    <g transform="translate(133,133)">
                        <path id="mb-s-hour" d="M0,12L0,-42" transform="rotate(180)" style="fill: none; stroke: #00000066; stroke-width: 10px; display: block; stroke-linecap:round; filter:blur(4px)"/>
                    </g>

                    <g transform="translate(130,130)">
                        <path id="mb-hour" d="M0,12L0,-42" transform="rotate(180)" style="fill: none; stroke: #FE5041DD; stroke-width: 10px; display: block; stroke-linecap:round;"/>
                    </g>


                    <g transform="translate(133,133)">
                        <path id="mb-s-second" d="M0,12L0,-64" transform="rotate(30)" style="fill: none; stroke: #00000066; stroke-width: 5px; display: block; stroke-linecap:round; filter:blur(4px)"/>
                    </g>

                    <g transform="translate(130,130)">
                        <path id="mb-second" d="M0,12L0,-64" transform="rotate(30)" style="fill: none; stroke: #685EFFDD; stroke-width: 5px; display: block; stroke-linecap:round;"/>
                    </g>

                    <circle id="mb-middle-circle" cx="130" cy="130" r="1" style="fill:#ccc; stroke:none"/>
                    </svg><span id="digital-clock"></span></span>`;
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (newValue !== oldValue) {
            this[attrName] = this.hasAttribute(attrName);
        }
    }

    get digital() {
        return this.hasAttribute('digital');
    }
    set digital(isDigital) {
        if (isDigital) {
            this.setAttribute('digital', true);
        } else {
            this.removeAttribute('digital');
            this.sr.querySelector('#digital-clock').innerHTML = '';
        }
    }

    get stopTime() {
        return this._stopTime;
    }

    stopTime(stop) {
        this._stopTime = true;
        window.cancelAnimationFrame(this.animationId);
    }
    startTime(start) {
        this._stopTime = false;
        this.doClock(this);
    }

    connectedCallback() {
        var color = window.getComputedStyle(this, null).color;
//         this.sr.querySelector('#mb-main-circle').style.stroke = color;
//         this.sr.querySelector('#mb-hour').style.stroke = color;
//         this.sr.querySelector('#mb-minute').style.stroke = color;
//         this.sr.querySelector('#mbheart').style.stroke = color;
//         this.sr.querySelector('#mbheart-1').style.stroke = color;
//         this.sr.querySelector('#mbheart-2').style.stroke = color;
        this.sr.querySelector('#mbheartsolid').style.fill = '#ffffff55';
        this.sr.querySelector('#mbcrossoutlined').style.stroke = '#ffffff55';
//        this.sr.querySelector('#mb-middle-circle').style.fill = color;
        this.sr.querySelector('span').style.whiteSpace = 'nowrap';
        this.doClock(this);
    }
    doClock(obj) {
        var obj = obj;
        var myDate = new Date();
        var hour = myDate.getHours();
        var minute = myDate.getMinutes();
        var second = myDate.getSeconds();

        var hDeg = 360 / 12 * hour + 30 / 60 * minute;
        var mDeg = 360 / 60 * minute;
        var sDeg = 360 / 60 * second;

        if (obj._hDeg != hDeg) {
            obj.sr.querySelector('#mb-hour').setAttribute('transform', 'rotate(' + hDeg + ')');
            obj.sr.querySelector('#mb-s-hour').setAttribute('transform', 'rotate(' + hDeg + ')');
            obj._hDeg = hDeg;
        }
        if (obj._mDeg != mDeg) {
            obj.sr.querySelector('#mb-minute').setAttribute('transform', 'rotate(' + mDeg + ')');
            obj.sr.querySelector('#mb-s-minute').setAttribute('transform', 'rotate(' + mDeg + ')');
            obj._mDeg = mDeg;
        }
        if (obj._sDeg != sDeg) {
            obj.sr.querySelector('#mb-second').setAttribute('transform', 'rotate(' + sDeg + ')');
            obj.sr.querySelector('#mb-s-second').setAttribute('transform', 'rotate(' + sDeg + ')');
            if (obj.digital) {
                hour = (hour < 10) ? '0' + hour : hour;
                minute = (minute < 10) ? '0' + minute : minute;
                second = (second < 10) ? '0' + second : second;
                //obj.snd.play();
                obj.second = second;
                //var arrTime = `${hour}:${minute}:${second}`;
                var arrTime = '&nbsp;' + hour + ':' + minute + ':' + second;
                obj.sr.querySelector('#digital-clock').innerHTML = arrTime;
            }
            else {
                if (obj.sr.querySelector('#digital-clock').innerHTML != '') {
                    obj.sr.querySelector('#digital-clock').innerHTML = '';
                }
            }
            obj._sDeg = sDeg;
        }
        obj.animationId = requestAnimationFrame(function() { obj.doClock(obj) });
    }
}

customElements.define('ab-clock', abClock);
