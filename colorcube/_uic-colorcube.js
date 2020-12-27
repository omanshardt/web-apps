class uicColorCube extends HTMLElement {
    constructor() {
        super();

        this.$wrapper = null;
        this.$cube = null;
        this.componentComputedWidth = null;
        this.componentComputedHeight = null;
        this.wrapperOffsetWidth = null;
        this.wrapperOffsetHeight = null;
        this.cubeOffsetWidth = null;
        this.cubeOffsetHeight = null;
        this.config = {
            explosionOffset: 0.25,
            shrinkOffset: 0.25,
            initialRotationX:-15,
            initialRotationY: 35,
            initialRotationZ: 0,
            borderWidth:2,
            minOpacity: 0.5,
            minBorderWidth:0,
            maxBorderWidth:10,
            tabInterval:400,
            dimmedSurfaceOpacity: 0.05,
            transitions: 'opacity 0.25s ease 0s, transform 1s ease 0s',
            transitionsOnlyTransparency: 'opacity 0.25s ease 0s',
            transitionsOnlyMovement: 'transform 1s ease 0s'
        };
        this.eventX = 0;
        this.eventY = 0;
        this.rotationX;
        this.rotationY;

        /**
         * This is the transformation in z-direction of every surface to exactly match their size and form a perfect cube
         */
        this.surfaceTransformZValue = null;

        /**
         * This is the transformation in z-direction of every surface to exactly match their size and form a perfect cube
         */
        this.surfaceOpacity = 0.75;

        /**
         * This is the current value by which the surfaces are moved back from the center without adapting their size
         */
        this.zValScale = 0;

        /**
         * This is the current value by which the surfaces are shrinked. Defaults to 0
         */
        this.surfaceShrinkFactor = 0;

        /**
         * This indicates if the mousemove event should be used to rotate the cube.
         * This should only be between mousedown and mouseup (touchstart and touchend)
         */
        this.mousemove = false;

        /**
         * This holds a reference to the selected surface
         */
        this.$selectedSurface = null;

        /**
         * This property help detecting doubletaps
         */
        this.timeout = null;

        /**
         * This property help detecting doubletaps
         */
        this.lastTap = 0;

        this.selectSurfaceHandler = new Function();

        this.sr = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      var $me = this;
      this.render();
      this.style.display = 'block';
      this.setUp();
      this.initRotatability();
      this.initSurfaceSelection();
      this.$selectedSurface = this.sr.querySelector('.surface.front');
      this.selectSurfaceHandler(this.$selectedSurface, 'front');
//       this.rs = ResizeSensor(this.$wrapper, function(elm) {
//           $me.setUp();
//       });
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          $me.setUp();
        }
      });
      resizeObserver.observe(this.$wrapper);
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('transition', this.config.transitions);
      // we could set width and height of the containing object here and would not need to define it on the containing page
      // the drawback is that this style is set as attribute on the element. better would be to have it as a style rule in a stylesheet
//       this.style.width = '100%';
//       this.style.height = '100%';
    }

    disconnectedCallback() {
      console.log('uic-colorcube is disconnected');
    }

    render() {
        this.sr.innerHTML = `
          <style id="css-colorcube">
            :root {
              background:brown;
            }
            .cubewrapper {
              --transform-local-z: 0px;

              --red-min: 0;
              --red-max: 255;
              --green-min: 0;
              --green-max: 255;
              --blue-min: 0;
              --blue-max: 255;

              --saturationPathWidthCube : 12px;
              --saturationPathWidth : 6px;

              box-sizing:border-box;
              display:flex;
              justify-content: center;
              align-items:center;
              border:10px solid #00cc00aa;
              width:100%;
              height:100%;
              /*box-shadow:inset 0px 0px 40px rgba(0, 0, 0, 1);*/
              /*filter: drop-shadow(0px 0px 15px #ffffffaa);*/
            }
            .cube {
                box-sizing:border-box;
                transform-style: preserve-3d;
                border:0px solid transparent;
                border-radius:20%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cube > .surface {
                box-sizing:border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                position: absolute;
                backface-visibility: inherit;
                font-size: 32px;
                border-width:2px;
                border-style:solid;
                border-color:#fff;
                opacity:0.75;
                color:#ffffff44;
                text-shadow:-1px -1px 0px #00000011;
                transition: ;
            }
            .cube > .surface > span {
              user-select: none;
            }
            .surface {
              background-blend-mode: screen;
            }
            .surface.left {
              transform: rotateY(-90deg) translateZ(var(--transform-local-z));
              background:
                linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%),
                linear-gradient(90deg, rgba(var(--red-min),var(--green-min),var(--blue-max),1) 0%, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 100%);
            }
            .surface.front {
              transform: translateZ(var(--transform-local-z));
              background:
                linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%),
                linear-gradient(90deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-min),var(--green-max),var(--blue-min),1) 100%);
            }
            .surface.right {
              transform: rotateY(90deg) translateZ(var(--transform-local-z));
              background:
                linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%),
                linear-gradient(90deg, rgba(var(--red-min),var(--green-max),var(--blue-min),1) 0%, rgba(var(--red-min),var(--green-max),var(--blue-max),1) 100%);
            }
            .surface.back {
              transform: rotateY(180deg) translateZ(var(--transform-local-z));
              background:
                linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%),
                linear-gradient(90deg, rgba(var(--red-min),var(--green-max),var(--blue-max),1) 0%, rgba(var(--red-min),var(--green-min),var(--blue-max),1) 100%);
            }
            .surface.top {
              transform: rotateX(90deg) translateZ(var(--transform-local-z));
              background:
                linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-min),var(--green-min),var(--blue-max),1) 100%),
                linear-gradient(90deg, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-max),var(--blue-min),1) 100%);
            }
            .surface.bottom {
              transform: rotateX(-90deg) translateZ(var(--transform-local-z));
              background:
                linear-gradient(90deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-min),var(--green-max),var(--blue-min),1) 100%),
                linear-gradient(180deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-min),var(--green-min),var(--blue-max),1) 100%);
            }
          </style>

          <div class="cubewrapper">
            <div class="cube">
                <div class="surface left"><span>left</span></div>
                <div class="surface front"><span>front</span></div>
                <div class="surface right"><span>right</span></div>
                <div class="surface back"><span>back</span></div>
                <div class="surface top"><span>top</span></div>
                <div class="surface bottom"><span>bottom</span></div>
            </div>
          </div>`;
    }

    setUp() {
      this.$wrapper = this.sr.querySelector('.cubewrapper');
      this.$cube = this.sr.querySelector('.cube');

//       this.componentComputedWidth = '100%';
//       this.componentComputedHeight = '100%';
// 
//       this.$wrapper.style.width = this.componentComputedWidth;
//       this.$wrapper.style.width = this.componentComputedWidth;
//       this.$wrapper.style.height = this.componentComputedHeight;

      this.wrapperOffsetWidth = this.$wrapper.offsetWidth;
      this.wrapperOffsetHeight = this.$wrapper.offsetHeight;

      // let the browser convert prozentual values in pixel value and use this value for both width and height
      this.$cube.style.width = (Math.min(this.wrapperOffsetWidth, this.wrapperOffsetHeight) / this.wrapperOffsetWidth * 100 * 0.55) + '%';
      this.$cube.style.width = this.$cube.offsetWidth + 'px';
      this.$cube.style.height = this.$cube.offsetWidth + 'px';

      this.cubeOffsetWidth = this.$cube.offsetWidth;
      this.cubeOffsetHeight = this.$cube.offsetHeight;

      this.explode(0);
      this.shrinkSurfaces(0);

       this.getStyleSheetRule('#css-colorcube', '.cube').style.setProperty('transform', 'perspective(' + this.cubeOffsetWidth * 5.0 + 'px) rotateX(' + this.config.initialRotationX + 'deg) rotateY(' + this.config.initialRotationY + 'deg) rotateZ(' + this.config.initialRotationZ + 'deg)');
    }

    initRotatability() {
      this.$wrapper.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.initRotation(e);
      } ,{passive: false});
      document.addEventListener('mousemove', (e) => {
        if (this.mousemove) {
          this.rotate(e, 512);
        }
      } ,{passive: false});
      document.addEventListener('mouseup', (e) => {
        this.stopRotation(e);
      } ,{passive: false});

      this.$wrapper.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.initRotation(e);
      } ,{passive: false});
      this.$wrapper.addEventListener('touchmove', (e) => {
        if (this.mousemove) {
          e.preventDefault();
          this.rotate(e, 512);
        }
      } ,{passive: false});
      this.$wrapper.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.stopRotation(e);
      } ,{passive: false});
    }

    initSurfaceSelection() {
      let surfaces = this.$cube.querySelectorAll('.surface');
      let $elm = this;
      let resetSelectedSurfaceZPosition = () => {
          let classArray = Array.from($elm.$selectedSurface.classList);
          let selectedSurfaceSelector = '.' + classArray.join('.');
          let lZ = $elm.getStyleSheetRule('#css-colorcube', '.cubewrapper').style.getPropertyValue('--transform-local-z');
          let transform = $elm.getStyleSheetRule('#css-colorcube', selectedSurfaceSelector).style.getPropertyValue('transform');
          const regex = /translateZ\((.*)\)/gm;
          transform = transform.replace(regex, 'translateZ(var(--transform-local-z))');
          $elm.getStyleSheetRule('#css-colorcube', selectedSurfaceSelector).style.setProperty('transform', transform);
          let transform2 = $elm.getStyleSheetRule('#css-colorcube', selectedSurfaceSelector).style.getPropertyValue('transform');
      };
      surfaces.forEach(($surface) => {
        $surface.addEventListener('mousedown', function(e) {
          e.preventDefault();
        });
        $surface.addEventListener('dblclick', function(e) {
          e.preventDefault();
          e.stopPropagation();

          resetSelectedSurfaceZPosition();

          // assign clicked surface as selectedSurface
          $elm.$selectedSurface = this;
          let surfaceId = null;
          if ($elm.$selectedSurface.classList.contains('left')) {
            surfaceId = 'left';
          }
          else if ($elm.$selectedSurface.classList.contains('front')) {
            surfaceId = 'front';
          }
          else if ($elm.$selectedSurface.classList.contains('right')) {
            surfaceId = 'right';
          }
          else if ($elm.$selectedSurface.classList.contains('back')) {
            surfaceId = 'back';
          }
          else if ($elm.$selectedSurface.classList.contains('top')) {
            surfaceId = 'top';
          }
          else if ($elm.$selectedSurface.classList.contains('bottom')) {
            surfaceId = 'bottom';
          }
          $elm.selectSurfaceHandler($elm.$selectedSurface, surfaceId);
        });
        $surface.addEventListener('touchend', function(e) {
          let currentTime = new Date().getTime();
          let tapLength = currentTime - $elm.lastTap;
          clearTimeout($elm.timeout);
          if (tapLength > 0 && tapLength < $elm.config.tabInterval) {
              e.preventDefault();

              resetSelectedSurfaceZPosition();

              $elm.$selectedSurface = this;
              let surfaceId = null;
              if ($elm.$selectedSurface.classList.contains('left')) {
                surfaceId = 'left';
              }
              else if ($elm.$selectedSurface.classList.contains('front')) {
                surfaceId = 'front';
              }
              else if ($elm.$selectedSurface.classList.contains('right')) {
                surfaceId = 'right';
              }
              else if ($elm.$selectedSurface.classList.contains('back')) {
                surfaceId = 'back';
              }
              else if ($elm.$selectedSurface.classList.contains('top')) {
                surfaceId = 'top';
              }
              else if ($elm.$selectedSurface.classList.contains('bottom')) {
                surfaceId = 'bottom';
              }
              $elm.selectSurfaceHandler($elm.$selectedSurface, surfaceId);
          }
          else {
            $elm.lastTap = currentTime;
          }
        } ,{passive: false});
      });
    }

    startPreventingOpacityAnimation() {
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.removeProperty('transition');
    }

    setOpacity(val) {
        this.surfaceOpacity = this.config.minOpacity + (1 - this.config.minOpacity) * val;
        this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('opacity', this.surfaceOpacity);
    };

    stopPreventingOpacityAnimation() {
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('transition', this.config.transitions);
    }

    getOpacity() {
        return this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.getPropertyValue('opacity');
    };

    setBorderWidth(val) {
        let borderWidth = Math.max(0, Math.min(10, val));
        this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('border-width',val + 'px');
    }

    getOpacity() {
        return this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.getPropertyValue('border-width');
    };

    explode(val = 0) {
      if (val) {
        this.zValScale = Math.max(0,Math.min(1,val));
      }
      this.surfaceTransformZValue = ((this.cubeOffsetWidth / 2) + ((this.cubeOffsetWidth / 2) * (this.config.explosionOffset) * this.zValScale)) * 1;
      this.getStyleSheetRule('#css-colorcube', '.cubewrapper').style.setProperty('--transform-local-z', this.surfaceTransformZValue + 'px');
    }

    shrinkSurfaces(val = null) {
      if (val) {
        this.surfaceShrinkFactor = Math.max(0,Math.min(1,val));
      }
      let f = 100 - (this.surfaceShrinkFactor * 100 * this.config.shrinkOffset);
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('width', `${f}%`);
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('height', `${f}%`);
    }

    moveSurface(value) {
      var color = 0;
      if (value <= 1) {
          if (this.$selectedSurface.classList.contains('left')) {
              color = (-value  + 1) / 2 * 255;
              this.getStyleSheetRule('#css-colorcube', '.surface.left').style.setProperty('transform', `rotateY(-90deg) translateZ(calc(var(--transform-local-z) * ${value} ))`);
              this.getStyleSheetRule('#css-colorcube', '.surface.left').style.setProperty('background', `linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%), linear-gradient(90deg, rgba(var(--red-min),${color},var(--blue-max),1) 0%, rgba(var(--red-min),${color},var(--blue-min),1) 100%)`);
          }
          else if(this.$selectedSurface.classList.contains('front')) {
              color = (-value  + 1) / 2 * 255;
              this.getStyleSheetRule('#css-colorcube', '.surface.front').style.setProperty('transform', `translateZ(calc(var(--transform-local-z) * ${value} ))`);
              this.getStyleSheetRule('#css-colorcube', '.surface.front').style.setProperty('background', `linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%), linear-gradient(90deg, rgba(var(--red-min),var(--green-min),${color},1) 0%, rgba(var(--red-min),var(--green-max),${color},1) 100%)`);
          }
          else if (this.$selectedSurface.classList.contains('right')) {
              color = 255 + (value  - 1) / 2 * 255;
              this.getStyleSheetRule('#css-colorcube', '.surface.right').style.setProperty('transform', `rotateY(90deg) translateZ(calc(var(--transform-local-z) * ${value} ))`);
              this.getStyleSheetRule('#css-colorcube', '.surface.right').style.setProperty('background', `linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%), linear-gradient(90deg, rgba(var(--red-min),${color},var(--blue-min),1) 0%, rgba(var(--red-min),${color},var(--blue-max),1) 100%)`);
          }
          else if (this.$selectedSurface.classList.contains('back')) {
              color = 255 + (value  - 1) / 2 * 255;
              this.getStyleSheetRule('#css-colorcube', '.surface.back').style.setProperty('transform', `rotateY(180deg) translateZ(calc(var(--transform-local-z) * ${value} ))`);
              this.getStyleSheetRule('#css-colorcube', '.surface.back').style.setProperty('background', `linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-max),var(--green-min),var(--blue-min),1) 100%), linear-gradient(90deg, rgba(var(--red-min),var(--green-max),${color},1) 0%, rgba(var(--red-min),var(--green-min),${color},1) 100%)`);
          }
          else if (this.$selectedSurface.classList.contains('top')) {
              color = 255 + (value  - 1) / 2 * 255;
              this.getStyleSheetRule('#css-colorcube', '.surface.top').style.setProperty('transform', `rotateX(90deg) translateZ(calc(var(--transform-local-z) * ${value} ))`);
              this.getStyleSheetRule('#css-colorcube', '.surface.top').style.setProperty('background', `linear-gradient(0deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-min),var(--green-min),var(--blue-max),1) 100%), linear-gradient(90deg, rgba(${color},var(--green-min),var(--blue-min),1) 0%, rgba(${color},var(--green-max),var(--blue-min),1) 100%)`);
          }
          else if (this.$selectedSurface.classList.contains('bottom')) {
              color = (-value  + 1) / 2 * 255;
              this.getStyleSheetRule('#css-colorcube', '.surface.bottom').style.setProperty('transform', `rotateX(-90deg) translateZ(calc(var(--transform-local-z) * ${value} ))`);
              this.getStyleSheetRule('#css-colorcube', '.surface.bottom').style.setProperty('background', `linear-gradient(90deg, rgba(var(--red-min),var(--green-min),var(--blue-min),1) 0%, rgba(var(--red-min),var(--green-max),var(--blue-min),1) 100%), linear-gradient(180deg, rgba(${color},var(--green-min),var(--blue-min),1) 0%, rgba(${color},var(--green-min),var(--blue-max),1) 100%)`);
          }
      }
      else {
          $elm.$selectedSurface.style.transform = '';
      }
    }

    initRotation(e) {
      this.mousemove = true;
      this.eventX = e.clientX || e.changedTouches[0].clientX;
      this.eventY = e.clientY || e.changedTouches[0].clientY;
      var cubeTransform = this.getStyleSheetRule('#css-colorcube', '.cube').style.getPropertyValue('transform');
      if (cubeTransform != '') {
          const regex = /rotateX\((.*?)deg\).*?rotateY\((.*?)deg\).*?rotateZ\((.*?)deg\)/gm;

          var res = [];
          var m;
          while ((m = regex.exec(cubeTransform)) !== null) {
              // This is necessary to avoid infinite loops with zero-width matches
              if (m.index === regex.lastIndex) {
                  regex.lastIndex++;
              }
              
              // The result can be accessed through the `m`-variable.
              m.forEach((match, groupIndex) => {
                  res.push(match);
              });
          }
          this.rotationX = parseFloat(res[2]) || 0;
          this.rotationY = parseFloat(res[1]) || 0;
      }
    }

    rotate(e, mouseSensivity = 512) {
      var localX = e.clientX || e.changedTouches[0].clientX;
      var localY = e.clientY || e.changedTouches[0].clientY;

      let deltaX = localX - this.eventX;
      let deltaY = localY - this.eventY;

      let degX = this.rotationX + (deltaX / mouseSensivity * 360);
      let degY = this.rotationY + (- (deltaY / mouseSensivity * 360));
      this.getStyleSheetRule('#css-colorcube', '.cube').style.setProperty('transform', `perspective(900px) rotateX(${degY}deg) rotateY(${degX}deg) rotateZ(0deg)`);
    }

    stopRotation(e) {
      this.mousemove = false;
    }

    reduceSurfaceOpacity(val = null) {
      val = val || this.config.dimmedSurfaceOpacity;
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('opacity', val);
    }

    resetSurfaceOpacity() {
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('opacity', this.surfaceOpacity);
    }

    setSelectedSurfaceHighlight() {
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('transition', this.config.transitionsOnlyTransparency);
      this.reduceSurfaceOpacity();
      this.$selectedSurface.style.opacity = 1;
    }

    undoSelectedSurfaceHighlight() {
      this.getStyleSheetRule('#css-colorcube', '.cube > .surface').style.setProperty('transition', this.config.transitions);
      this.resetSurfaceOpacity();
      this.$selectedSurface.style.opacity = '';
    }
    

    getStyleSheetRule(styleSheetSelector, selectorText) {
      var cssStyleSheet = this.sr.querySelector(styleSheetSelector).sheet;
      if (cssStyleSheet instanceof CSSStyleSheet) {
        var cssRuleList = cssStyleSheet.cssRules;
        for (var i in cssRuleList) {
          var rule = cssRuleList[i];
          if (rule.selectorText === selectorText) {
            return rule;
          }
        }
      }
      return null;
    }

//     calculateLocalZValue(val = 1) {
//       this.surfaceTransformZValue = (this.cubeOffsetWidth / 2) + (this.config.explosionOffset * val) - 1;
//     }
}

customElements.define('uic-colorcube', uicColorCube);