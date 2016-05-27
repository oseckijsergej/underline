"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function ($) {
    $.fn.underline = function () {
        var _this = this;

        var settings = arguments.length <= 0 || arguments[0] === undefined ? {
            waitFor: null,
            initTimeOut: 100
        } : arguments[0];

        setTimeout(function () {
            _this.each(function (index, item) {
                new UnderlineItem(item);
            });
        }, settings.initTimeOut);
    };

    var UnderlineItem = function () {
        function UnderlineItem(element) {
            var _this2 = this;

            _classCallCheck(this, UnderlineItem);

            this.element = element;
            this.refresh();
            $(window).resize(function () {
                return _this2.refresh();
            });
        }

        _createClass(UnderlineItem, [{
            key: 'defineTextItems',
            value: function defineTextItems(element) {
                var _this3 = this;

                if (element.nodeType == 3) {
                    var textItem = new UnderlineTextItem(element);
                    if (textItem.words) {
                        this.elements.push(textItem);
                    }
                } else if (element.childNodes.length > 0) {
                    $(element.childNodes).each(function (index, item) {
                        _this3.defineTextItems(item);
                    });
                }
            }
        }, {
            key: 'refresh',
            value: function refresh() {
                this.elements = [];
                $('canvas', this.element).remove();
                this.element.normalize();
                this.defineTextItems(this.element);
                this.elements.forEach(function (item, index) {
                    item.init();
                });
            }
        }]);

        return UnderlineItem;
    }();

    var UnderlineTextItem = function () {
        function UnderlineTextItem(element) {
            _classCallCheck(this, UnderlineTextItem);

            this.element = element;
            this.defineWords();
            if (!this.words) return;
            this.defineRelativeContainer();
        }

        _createClass(UnderlineTextItem, [{
            key: 'init',
            value: function init() {
                this.fixRelativeContainer();
                this.createTmpLine();
                this.processElement();
                this.removeTmpLine();
                this.unfixRelativeContainer();
            }
        }, {
            key: 'createTmpLine',
            value: function createTmpLine() {
                $(this.element).wrap('<span></span>');
                this.tmpLine = this.element.parentNode;
            }
        }, {
            key: 'removeTmpLine',
            value: function removeTmpLine() {
                $(this.tmpLine).remove();
            }
        }, {
            key: 'fixRelativeContainer',
            value: function fixRelativeContainer() {
                $(this.relativeContainer).css('height', window.getComputedStyle(this.relativeContainer, null).getPropertyValue("height"));
            }
        }, {
            key: 'unfixRelativeContainer',
            value: function unfixRelativeContainer() {
                this.relativeContainer.style.height = this.relativeContainerOldStyles.height;
            }
        }, {
            key: 'defineWords',
            value: function defineWords() {
                this.words = this.element.textContent.replace(/[\n|\s+?]/g, ' ').match(/\s?[^\s-]+-?\s?/g);
            }
        }, {
            key: 'defineRelativeContainer',
            value: function defineRelativeContainer() {
                this.relativeContainer = this.element.parentNode;
                while (!(window.getComputedStyle(this.relativeContainer, null).getPropertyValue("display") == 'block' && window.getComputedStyle(this.relativeContainer, null).getPropertyValue("position") == 'relative') && this.relativeContainer.parentNode.nodeName !== 'HTML') {
                    this.relativeContainer = this.relativeContainer.parentNode;
                }
                this.relativeContainerOldStyles = {
                    height: this.relativeContainer.style.height
                };
            }
        }, {
            key: 'processElement',
            value: function processElement() {
                var computedHeight;
                var words = this.words.slice(0);
                this.element.nodeValue = '';
                //words[0] = ' ' + words[0];
                do {
                    this.tmpLine.textContent = words[0];
                    computedHeight = this.tmpLine.getBoundingClientRect().height;
                    for (var i = 0; i <= words.length; i++) {
                        this.tmpLine.textContent = words.slice(0, i).join('');
                        if (Math.floor(this.tmpLine.getBoundingClientRect().height) > Math.floor(computedHeight)) {
                            this.tmpLine.textContent = words.splice(0, i - 1).join('');
                            this.generateUnderline();
                            break;
                        } else if (words.length == i) {
                            this.tmpLine.textContent = words.splice(0, i).join('');
                            this.generateUnderline();
                        }
                    }
                } while (words.length > 0);
            }
        }, {
            key: 'generateUnderline',
            value: function generateUnderline() {
                var underline = new Underline(this.tmpLine);
                underline.createLine();
                underline.createHoles();
                $(this.tmpLine.childNodes).insertBefore(this.tmpLine);
            }
        }]);

        return UnderlineTextItem;
    }();

    var Underline = function () {
        function Underline(element) {
            _classCallCheck(this, Underline);

            this.element = element;
            this.defineStyles();
            this.text = this.element.innerText;
            this.createCanvas();
            this.defineCanvasStyles();
        }

        _createClass(Underline, [{
            key: 'createCanvas',
            value: function createCanvas() {
                var offset = $(this.element).offset();
                this.canvas = document.createElement("canvas");
                this.ctx = this.canvas.getContext('2d');

                if (!window.devicePixelRatio) {
                    window.devicePixelRatio = window.screen.deviceXDPI / window.screen.logicalXDPI;
                }
                this.ratio = window.devicePixelRatio;
                this.canvas.width = this.styles.width * this.ratio;
                this.canvas.height = this.styles.height * this.ratio;

                this.canvas.style.top = offset.top + 'px';
                this.canvas.style.left = offset.left + 'px';
                this.canvas.style.width = this.styles.width + 'px';
                this.canvas.style.position = 'absolute';

                this.element.appendChild(this.canvas);
            }
        }, {
            key: 'createLine',
            value: function createLine() {

                this.textWidth = this.ctx.measureText(this.text).width;
                if (this.ration > 1) {
                    this.textWidth *= this.ratio;
                }

                this.startPoint = { x: 0, y: this.underlinePosition };
                this.endPoint = { x: this.textWidth, y: this.underlinePosition };

                this.maxGrabDistance = this.strokeWidth * 2;
                this.maxControlDistance = this.strokeWidth * 6;

                this.ctx.lineWidth = this.strokeWidth;
                this.ctx.strokeStyle = this.styles.fontColor;

                this.ctx.beginPath();
                this.ctx.moveTo(this.startPoint.x, this.startPoint.y);
                this.ctx.lineTo(this.endPoint.x, this.endPoint.y);
                this.ctx.globalCompositeOperation = "source-over";
                this.ctx.stroke();
            }
        }, {
            key: 'createHoles',
            value: function createHoles() {
                // draw the font stroke
                this.ctx.font = this.font;
                this.ctx.textBaseline = 'top';

                this.ctx.globalCompositeOperation = "destination-out";

                this.ctx.lineWidth = 2 * this.ratio + this.strokeWidth * 3.6;
                this.ctx.strokeStyle = 'blue';
                this.ctx.beginPath();
                var adjustY = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? this.ctx.canvas.scrollHeight * 0.1 : 0;

                this.ctx.strokeText(this.text, -0.2, adjustY);

                this.ctx.fillStyle = 'transparent';
                this.ctx.beginPath();
                this.ctx.fillText(this.text, -0.2, adjustY);
            }
        }, {
            key: 'defineCanvasStyles',
            value: function defineCanvasStyles() {
                this.ctx.font = this.font = this.styles.fontStyle + ' ' + this.multiplyValue(this.styles.fontSize, this.ratio) + ' ' + this.styles.fontFamily;

                // determine the text-underline-width / strokeWidth
                var dotWidth = this.ctx.measureText('.')['width'];

                this.strokeWidth = dotWidth / 12;

                this.strokeColor = this.styles.fontColor;

                // determine the text-underline-position / underlinePosition
                // text-underline-position in ratio, todo: default and user set position ratio
                this.underlinePosition = parseFloat(this.styles.height) * this.ratio * (1 - this.styles.baselinePositionRatio + this.styles.baselinePositionRatio * 0.4) + this.strokeWidth / 2;

                var adjustValue = this.optimalStrokeWidthPos(this.strokeWidth, this.underlinePosition);
                this.strokeWidth = adjustValue.strokeWidth;
                this.underlinePosition = adjustValue.posY;
            }
        }, {
            key: 'defineStyles',
            value: function defineStyles() {
                this.styles = {
                    baselinePositionRatio: this.baselineRatio(),
                    lineHeight: parseFloat(window.getComputedStyle(this.element, null).getPropertyValue("line-height")),
                    fontFamily: window.getComputedStyle(this.element, null).getPropertyValue("font-family"),
                    fontSize: window.getComputedStyle(this.element, null).getPropertyValue("font-size"),
                    fontColor: window.getComputedStyle(this.element, null).getPropertyValue("color"),
                    fontStyle: window.getComputedStyle(this.element, null).getPropertyValue("font-style"),
                    width: this.element.getBoundingClientRect().width,
                    height: this.element.getBoundingClientRect().height,
                    parentWidth: this.element.parentNode.getBoundingClientRect().width,
                    offsetLeft: this.element.offsetLeft
                };
            }
        }, {
            key: 'baselineRatio',
            value: function baselineRatio() {
                // Get the baseline in the context of whatever element is passed in.
                var element = this.element || document.body;

                // The container is a little defenseive.
                var container = document.createElement('div');
                container.style.display = "block";
                container.style.position = "absolute";
                container.style.bottom = "0";
                container.style.right = "0";
                container.style.width = "0px";
                container.style.height = "0px";
                container.style.margin = "0";
                container.style.padding = "0";
                container.style.visibility = "hidden";
                container.style.overflow = "hidden";

                // Intentionally unprotected style definition.
                var small = document.createElement('span');
                var large = document.createElement('span');

                // Large numbers help improve accuracy.
                small.style.fontSize = "0px";
                large.style.fontSize = "2000px";

                small.innerHTML = "X";
                large.innerHTML = "X";

                container.appendChild(small);
                container.appendChild(large);

                // Put the element in the DOM for a split second.
                element.appendChild(container);
                var smalldims = small.getBoundingClientRect();
                var largedims = large.getBoundingClientRect();
                element.removeChild(container);

                // Calculate where the baseline was, percentage-wise.
                var baselineposition = smalldims.top - largedims.top;
                var height = largedims.height;

                return 1 - baselineposition / height;
            }
        }, {
            key: 'optimalStrokeWidthPos',
            value: function optimalStrokeWidthPos(strokeWidth, posY) {
                if (strokeWidth < 1) {
                    posY = Math.round(posY - 0.5) + 0.5;
                } else if (strokeWidth >= 1) {
                    strokeWidth = Math.round(strokeWidth);
                    if (strokeWidth % 2) {
                        // odd, posY -> 0.5
                        posY = Math.round(posY - 0.5) + 0.5;
                    } else {
                        // even, posY -> 1
                        posY = Math.round(posY);
                    }
                }
                return {
                    strokeWidth: strokeWidth,
                    posY: posY
                };
            }
        }, {
            key: 'multiplyValue',
            value: function multiplyValue(value, multiplier) {
                var str = value;
                var m = multiplier;
                var result = str.match(/(\d*\.?\d*)(.*)/);
                //http://stackoverflow.com/questions/2868947/split1px-into-1px-1-px-in-javascript
                return result[1] * m + result[2];
            }
        }]);

        return Underline;
    }();
})(jQuery);