
lychee.define('lychee.game.Entity').exports(function(lychee) {

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		this.__clock = null;
		this.__shape = null;

		this.__animation = null;
		this.__effect = null;
		this.__tween = null;

		this.__position = {
			x: 0, y: 0, z: 0
		};

		this.setPosition(this.settings.position);
		this.setShape(this.settings.shape);

	};


	Class.COLLISION = {
		none: 0,
		A:    1,
		B:    2,
		C:    3,
		D:    4
	};


	Class.EFFECT = {

		wobble: {

			duration: 1000,

			defaults: {
				x: 0,
				y: 0,
				z: 0
			},

			callback: function(effect, t) {

				var s = effect.settings;

				if (effect.origin === undefined) {
					var position = this.getPosition();
					effect.origin = {
						x: position.x,
						y: position.y,
						z: position.z
					};
				}

				var newPosition = {
					x: effect.origin.x + Math.sin(t * 2 * Math.PI) * s.x,
					y: effect.origin.y + Math.sin(t * 2 * Math.PI) * s.y,
					z: effect.origin.z + Math.sin(t * 2 * Math.PI) * s.z
				};

				this.setPosition(newPosition);

			}

		}

	};


	Class.SHAPE = {
		circle:  0,
		box:     1,
		polygon: 2
	};


	Class.TWEEN = {

		linear: function(t, dx, dy, dz) {

			return {
				x: t * dx,
				y: t * dy,
				z: t * dz
			};

		},

		easeIn: function(t, dx, dy, dz) {

			var f = 1 * Math.pow(t, 3);

			return {
				x: f * dx,
				y: f * dy,
				z: f * dz
			};

		},

		easeOut: function(t, dx, dy, dz) {

			var f = Math.pow(t - 1, 3) + 1;

			return {
				x: f * dx,
				y: f * dy,
				z: f * dz
			};

		},

		easeInOut: function(t, dx, dy, dz) {

			var f;

			if ((t /= 0.5) < 1) {
				f = 0.5 * Math.pow(t, 3);
			} else {
				f = 0.5 * (Math.pow(t - 2, 3) + 2);
			}

			return {
				x: f * dx,
				y: f * dy,
				z: f * dz
			};

		},

		bounceEaseIn: function(t, dx, dy, dz) {

			var k = 1 - t;
			var f;
			if ((k /= 1) < ( 1 / 2.75 )) {
				f = 1 * ( 7.5625 * Math.pow(k, 2) );
			} else if (k < ( 2 / 2.75 )) {
				f = 7.5625 * ( k -= ( 1.5 / 2.75 )) * k + .75;
			} else if (k < ( 2.5 / 2.75 )) {
				f = 7.5625 * ( k -= ( 2.25 / 2.75 )) * k + .9375;
			} else {
				f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + .984375;
			}

			return {
				x: (1 - f) * dx,
				y: (1 - f) * dy,
				z: (1 - f) * dz
			};

		},

		bounceEaseOut: function(t, dx, dy, dz) {

			var f;
			if ((t /= 1) < ( 1 / 2.75 )) {
				f = 1 * ( 7.5625 * Math.pow(t, 2) );
			} else if (t < ( 2 / 2.75 )) {
				f = 7.5625 * ( t -= ( 1.5 / 2.75 )) * t + .75;
			} else if (t < ( 2.5 / 2.75 )) {
				f = 7.5625 * ( t -= ( 2.25 / 2.75 )) * t + .9375;
			} else {
				f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + .984375;
			}

			return {
				x: f * dx,
				y: f * dy,
				z: f * dz
			};

		},

		sinEaseIn: function(t, dx, dy, dz) {

			var f = -1 * Math.cos(t * Math.PI / 2 ) + 1;

			return {
				x: f * dx,
				y: f * dy,
				z: f * dz
			};

		},

		sinEaseOut: function(t, dx, dy, dz) {

			var f = 1 * Math.sin(t * Math.PI / 2);

			return {
				x: f * dx,
				y: f * dy,
				z: f * dz
			};

		}

	};


	Class.prototype = {

		defaults: {

			position: {
				x: 0, y: 0, z: 0
			},

			shape: Class.SHAPE.circle,
			collision: Class.COLLISION.none

		},

		sync: function(clock) {

			if (this.__clock === null) {

				if (this.__tween !== null) {
					this.__tween.start = clock;
				}

				if (this.__effect !== null) {
					this.__effect.start = clock;
				}

				if (this.__animation !== null) {
					this.__animation.start = clock;
				}

				this.__clock = clock;

			}

		},

		update: function(clock, delta) {


			// Sync clocks initially (if Entity was created before loop started)
			if (this.__clock === null) {
				this.sync(clock);
			}


			var t = 0;

			if (this.__tween !== null && (this.__clock <= this.__tween.start + this.__tween.duration)) {

				t = (this.__clock - this.__tween.start) / this.__tween.duration;

				var diff;

				var delta = {};
				if (typeof this.__position.x === 'number') {
					delta.x = this.__tween.to.x - this.__tween.from.x;
				} else {
					delta.x = 0;
				}

				if (typeof this.__position.y === 'number') {
					delta.y = this.__tween.to.y - this.__tween.from.y;
				} else {
					delta.y = 0;
				}

				if (typeof this.__position.z === 'number') {
					delta.z = this.__tween.to.z - this.__tween.from.z;
				} else {
					delta.z = 0;
				}


				var diff = this.__tween.callback.call(this.__tween.scope, t, delta.x, delta.y, delta.z);

				var newPosition = {};
				if (typeof this.__position.x === 'number') {
					newPosition.x = this.__tween.from.x + diff.x;
				}

				if (typeof this.__position.y === 'number') {
					newPosition.y = this.__tween.from.y + diff.y;
				}

				if (typeof this.__position.z === 'number') {
					newPosition.z = this.__tween.from.z + diff.z;
				}

				this.setPosition(newPosition);

			} else if (this.__tween !== null) {

				// This case is for having not enough update
				// for tween to be finished in time.
				this.setPosition({
					x: this.__tween.to.x,
					y: this.__tween.to.y,
					z: this.__tween.to.z
				});

				this.__tween = null;

			}


			if (this.__effect !== null && (this.__clock <= this.__effect.start + this.__effect.duration)) {

				t = (this.__clock - this.__effect.start) / this.__effect.duration;
				this.__effect.callback.call(this.__effect.scope, this.__effect, t);

			} else if (this.__effect !== null) {

				if (this.__effect.loop === true) {
					this.__effect.start = this.__clock;
				} else {
					this.__effect = null;
				}

			}


			if (this.__animation !== null && (this.__clock <= this.__animation.start + this.__animation.duration)) {

				t = (this.__clock - this.__animation.start) / this.__animation.duration;
				this.__animation.frame = Math.floor(t * this.__animation.frames);

			} else if (this.__animation !== null) {

				if (this.__animation.loop === true) {
					this.__animation.start = this.__clock;
				} else {
					this.__animation = null;
				}

			}


			this.__clock = clock;

		},

		setTween: function(duration, position, callback, scope) {

			duration = typeof duration === 'number' ? duration : 0;
			callback = callback instanceof Function ? callback : Class.TWEEN.linear;
			scope = scope !== undefined ? scope : this;


			var tween = null;
			if (Object.prototype.toString.call(position) === '[object Object]') {

				position.x = typeof position.x === 'number' ? position.x : this.__position.x;
				position.y = typeof position.y === 'number' ? position.y : this.__position.y;
				position.z = typeof position.z === 'number' ? position.z : this.__position.z;

				var pos = this.getPosition();

				tween = {
					start: this.__clock,
					duration: duration,
					from: {
						x: pos.x,
						y: pos.y,
						z: pos.z
					},
					to: position,
					callback: callback,
					scope: scope
				};

			}


			this.__tween = tween;

		},

		getPosition: function() {
			return this.__position;
		},

		setPosition: function(position) {

			if (Object.prototype.toString.call(position) !== '[object Object]') {
				return false;
			}


			this.__position.x = typeof position.x === 'number' ? position.x : this.__position.x;
			this.__position.y = typeof position.y === 'number' ? position.y : this.__position.y;
			this.__position.z = typeof position.z === 'number' ? position.z : this.__position.z;

			return true;

		},

		getShape: function() {
			return this.__shape;
		},

		setShape: function(shape) {

			// FIXME: Somehow validate ENUM
			if (shape !== undefined) {
				this.__shape = shape;
				return true;
			}


			return false;

		},

		getFrame: function() {

			if (this.__animation === null) {
				return 0;
			} else {
				return this.__animation.frame;
			}

		},

		setAnimation: function(duration, settings, loop) {

			duration = typeof duration === 'number' ? duration : null;
			settings = Object.prototype.toString.call(settings) === '[object Object]' ? settings : null;
			loop = loop === true ? true : false;


			var animation = null;

			var _animationdefaults = {
				frame: 0,
				frames: 10,
				fps: 20
			};


			if (duration !== null || settings !== null) {

				var ani = lychee.extend({}, _animationdefaults, settings);

				animation = {
					start: this.__clock,
					frame: ani.frame,
					frames: ani.frames,
					fps: ani.fps,
					duration: duration || 1000,
					loop: loop
				};

			}


			this.__animation = animation;

		},

		setEffect: function(duration, data, settings, scope, loop) {

			duration = typeof duration === 'number' ? duration : (data.duration ? data.duration : 1000);
			settings = Object.prototype.toString.call(settings) === '[object Object]' ? settings : null;
			scope = scope !== undefined ? scope : this;
			loop = loop === true ? true : false;


			var effect = null;
			if (Object.prototype.toString.call(data) === '[object Object]') {

				if (
					data.callback instanceof Function
				) {

					effect = {
						start: this.__clock,
						callback: data.callback,
						duration: duration,
						scope: scope,
						loop: loop
					};

					if (Object.prototype.toString.call(data.defaults) === '[object Object]') {
						effect.settings = lychee.extend({}, data.defaults, settings);
					} else {
						effect.settings = settings;
					}

				}

			}


			this.__effect = effect;

		}

	};


	return Class;

});

