
/*
 * var input = new lychee.Input({});
 *
 * There are two ways of binding to key events:
 *
 * input.bind('key', function(key, delta) {
 * }, this);
 *
 * input.bind('ctrl-a', function(delta) {
 * }, this);
 *
 * input.bind('touch', function(position, delta) {
 * }, this);
 *
 * input.bind('toucharea-test', function(delta) {
 * }, this);
 *
 *
 *
 * Setup of Touchareas:
 *
 * input.addToucharea({
 *  id: 'test',
 *  element: document.getElementById('toucharea-test')
 * });
 *
 * input.addToucharea({
 *  id: 'test2',
 *  box: {
 *	  x1:  20,
 *	  y1:  20,
 *	  x2: 100,
 *	  y2: 100
 *  }
 * });
 *
 */

lychee.define('Input').tags({
	platform: 'html'
}).includes([
	'lychee.Events'
]).exports(function(lychee) {

	var _alreadyBound = false;

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);
		this.reset();

		lychee.Events.call(this, 'input');
		this.__init();

	};


	Class.prototype = {

		defaults: {
			delay: 200,
			fireModifier: false,
			fireSwipe: false
		},

		KEYMAP: {

			 8: 'backspace',
			 9: 'tab',
			13: 'enter',
			16: 'shift',
			17: 'ctrl',
			18: 'alt',
			19: 'pause',

			27: 'escape',
			32: 'space',

			48: '0',
			49: '1',
			50: '2',
			51: '3',
			52: '4',
			53: '5',
			54: '6',
			55: '7',
			56: '8',
			57: '9',

			65: 'a',
			66: 'b',
			67: 'c',
			68: 'd',
			69: 'e',
			70: 'f',
			71: 'g',
			72: 'h',
			73: 'i',
			74: 'j',
			75: 'k',
			76: 'l',
			77: 'm',
			78: 'n',
			79: 'o',
			80: 'p',
			81: 'q',
			82: 'r',
			83: 's',
			84: 't',
			85: 'u',
			86: 'v',
			87: 'w',
			88: 'x',
			89: 'y',
			90: 'z'

		},



		/*
		 * PRIVATE API
		 */
		__init: function() {

			if (_alreadyBound === true) {
				throw 'Only one lychee.Input instance is allowed, not multiple.';
			}


			var that = this;
			document.addEventListener('keydown', function(event) {
				that.__processKey(event.keyCode, event.ctrlKey, event.altKey, event.shiftKey);
			}, true);

			document.addEventListener('mousedown', function(event) {
				that.__processTouch(event);
			}, true);


			if (this.settings.fireSwipe === true) {

				document.addEventListener('mousemove', function(event) {
					that.__processSwipe('move', event);
				}, true);

				document.addEventListener('mouseup', function(event) {
					that.__processSwipe('end', event);
				}, true);

				document.addEventListener('mouseout', function(event) {
					that.__processSwipe('end', event);
				}, true);

			}


			var supportsTouch = 'ontouchstart' in window;
			if (supportsTouch === true) {

				document.addEventListener('touchstart', function(event) {

					event.preventDefault();
					event.stopPropagation();

					that.__processTouch(event);

				}, true);


				if (this.settings.fireSwipe === true) {

					document.addEventListener('touchmove', function(event) {
						that.__processSwipe('move', event);
					}, true);

					document.addEventListener('touchend', function(event) {
						that.__processSwipe('end', event);
					}, true);

				}

			}


			_alreadyBound = true;

		},

		__processKey: function(key, ctrl, alt, shift) {

			// Don't fire unknown keys
			if (this.KEYMAP[key] === undefined) {
				return;
			}

			ctrl = ctrl !== undefined ? ctrl : false;
			alt = alt !== undefined ? alt : false;
			shift = shift !== undefined ? shift : false;

			var delta = Date.now() - this.__last.key;
			if (delta < this.settings.delay) {
				return;
			}

			if (
				this.settings.fireModifier === false
				&& (key === 9 || key === 16 || key === 17 || key === 18)
			) {
				return;
			}


			var name = '';
			if (ctrl === true && this.KEYMAP[key] !== 'ctrl') {
				name += 'ctrl-';
			}

			if (alt === true && this.KEYMAP[key] !== 'alt') {
				name += 'alt-';
			}

			if (shift === true && this.KEYMAP[key] !== 'shift') {
				name += 'shift-';
			}


			name += this.KEYMAP[key];

			// allow both bind('key') and bind('ctrl-a')
			this.trigger('key', [ name, delta ]);
			this.trigger(name, [ delta ]);


			this.__last.key = Date.now();

		},

		__processTouch: function(event) {

			var delta = Date.now() - this.__last.touch;
			if (delta < this.settings.delay) {
				return;
			}

			// TODO: Add Multi-Touch support
			if (event.touches && event.touches.length) {
				event = event.touches[0];
			}

			var position = {
				x: event.pageX || event.clientX,
				y: event.pageY || event.clientY
			};


			var target = event.target || document.body;

			this.trigger('touch', [ { x: position.x, y: position.y }, delta ]);


			for (var id in this.__touchareas) {

				var toucharea = this.__touchareas[id];
				if (toucharea === null) continue;

				if (toucharea.element !== null) {

					if (toucharea.element === target) {
						this.trigger('toucharea-' + toucharea.id, [ delta ]);
					}

				} else if (toucharea.box !== null) {

					if (
						position.x > toucharea.box.x1 && position.x < toucharea.box.x2
						&& position.y > toucharea.box.y1 && position.y < toucharea.box.y2
					) {
						this.trigger('toucharea-' + toucharea.id, [ delta ]);
					}

				}

			}

			this.__last.touch = Date.now();


			if (this.__swipe === null && this.settings.fireSwipe === true) {

				this.trigger('swipe', [ 'start', { x: position.x, y: position.y }, delta ]);

				this.__swipe = {
					x: position.x,
					y: position.y
				};

			}

		},

		__processSwipe: function(state, event) {

			if (this.__swipe === null) return;

			var delta = Date.now() - this.__last.swipe;
			if (delta < this.settings.delay) {
				return;
			}

			// TODO: Add Multi-Touch support
			if (event.touches && event.touches.length) {
				event = event.touches[0];
			}

			var position = {
				x: event.pageX || event.clientX,
				y: event.pageY || event.clientY
			};


			var swipe = {
				x: position.x - this.__swipe.x,
				y: position.y - this.__swipe.y
			};

			if (state === 'move') {
				this.trigger('swipe', [ 'move', position, delta, swipe ]);
			} else if (state === 'end') {
				this.trigger('swipe', [ 'end', position, delta, swipe ]);
				this.__swipe = null;
			}

			this.__last.swipe = Date.now();

		},



		/*
		 * PUBLIC API
		 */
		reset: function() {

			this.__touchareas = {};
			this.__swipe = null;
			this.__last = {
				key: Date.now(),
				touch: Date.now(),
				swipe: Date.now()
			};

		},

		set: function(key, value) {

			if (this.settings[key] !== undefined) {

				value = value !== undefined ? value : this.defaults[key];
				this.settings[key] = value;

				return true;

			}


			return false;

		},

		addToucharea: function(id, settings) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && Object.prototype.toString.call(settings) === '[object Object]') {

				var toucharea = {
					id: id,
					element: null,
					box: null
				};


				if (settings.element) {

					if (settings.element instanceof HTMLElement) {

						toucharea.element = settings.element;
						this.__touchareas[toucharea.id] = toucharea;
						return true;

					} else {

						var element = document.querySelector(settings.element);
						if (element) {
							toucharea.element = settings.element;
						}

						this.__touchareas[toucharea.id] = toucharea;
						return true;

					}

				} else if (Object.prototype.toString.call(settings.box) === '[object Object]') {

					toucharea.box = {
						x1: settings.box.x1 || 0,
						x2: settings.box.x2 || Infinity,
						y1: settings.box.y1 || 0,
						y2: settings.box.y2 || Infinity
					};

					this.__touchareas[toucharea.id] = toucharea;
					return true;

				}

			}


			return false;

		},

		removeToucharea: function(id) {

			id = typeof id === 'string' ? id : null;

			if (id !== null && this.__touchareas[id] !== undefined) {

				this.__touchareas[id] = null;
				return true;

			}


			return false;

		}

	};


	return Class;

});

