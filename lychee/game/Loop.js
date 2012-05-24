
lychee.define('lychee.game.Loop').includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var _requestAniFrame = (
		global.requestAnimationFrame
		|| global.msRequestAnimationFrame
		|| global.mozRequestAnimationFrame
		|| global.oRequestAnimationFrame
		|| global.webkitRequestAnimationFrame
		|| null
	);

	var _globalIntervalId = null,
		_globalRequestAniFrame = null,
		_timeoutId = 0,
		_intervalId = 0;

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		this.__timeouts = {};
		this.__intervals = {};

		lychee.Events.call(this, 'loop');

		if (this.settings.requestAnimationFrame === false) {
			_requestAniFrame = null;
		}

		this.reset(this.settings.updateFps, this.settings.renderFps);

	};


	Class.prototype = {

		defaults: {
			context: null,
			renderFps: 60,
			updateFps: 60,
			requestAnimationFrame: false
		},

		reset: function(updateFps, renderFps) {

			// global interval is the ly.loop's interval
			if (_globalIntervalId !== null) {
				global.clearInterval(_globalIntervalId);
			}

			this.__clock = {
				start: Date.now(),
				update: 0,
				render: 0
			};

			this.__ms = {
				update: 1000 / updateFps,
				render: 1000 / renderFps
			};


			var that = this;

			if (_requestAniFrame === null) {

				this.__ms.min = this.__ms.update < this.__ms.render ? this.__ms.update : this.__ms.render;

				_globalIntervalId = global.setInterval(function() {

					var time = Date.now() - that.__clock.start;
					that.__renderLoop(time);
					that.__updateLoop(time);

				}, this.__ms.min);

			} else {

				this.__ms.min = this.__ms.update;

				if (_globalRequestAniFrame === null) {

					_requestAniFrame(function() {

						var time = Date.now() - that.__clock.start;
						that.__renderLoop(time);

					}, this.settings.context);


					// just a flag for avoiding multiple callstacks on reset()
					_globalRequestAniFrame = true;

				}

				_globalIntervalId = global.setInterval(function() {

					var time = Date.now() - that.__clock.start;
					that.__updateLoop(time);

				}, this.__ms.update);

			}


			// update settings now
			this.settings.updateFps = updateFps;
			this.settings.renderFps = renderFps;

		},

		start: function() {
			this.__state = 'running';
		},

		stop: function() {
			this.__state = 'stopped';
		},

		timeout: function(delta, callback, scope) {

			delta = typeof delta === 'number' ? delta : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : global;


			if (delta === null || callback === null) {
				return false;
			}


			var id = _timeoutId++;
			this.__timeouts[id] = {
				start: this.__clock.update + delta,
				callback: callback,
				scope: scope
			};


			var that = this;
			return {
				clear: function() {
					that.__timeouts[id] = null;
				}
			};

		},

		interval: function(delta, callback, scope) {

			delta = typeof delta === 'number' ? delta : null;
			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : global;


			if (delta === null || callback === null) {
				return false;
			}


			var id = _intervalId++;
			this.__intervals[id] = {
				start: this.__clock.update + delta,
				delta: delta,
				step: 0,
				callback: callback,
				scope: scope
			};


			var that = this;
			return {
				clear: function() {
					that.__intervals[id] = null;
				}
			};

		},

		__renderLoop: function(clock) {

			if (this.__state !== 'running') return;


			var delta = clock - this.__clock.render;

			if (delta >= this.__ms.render) {
				this.trigger('render', [ clock, delta ]);
				this.__clock.render = clock;
			}

			if (_requestAniFrame !== null) {

				var that = this;
				_requestAniFrame(function() {
					var time = Date.now() - that.__clock.start;
					that.__renderLoop(time);
				}, this.settings.context);

			}

		},

		__updateLoop: function(clock) {

			if (this.__state !== 'running') return;


			var delta = clock - this.__clock.update;

			if (
				delta >= this.__ms.update
				|| this.__ms.min === this.__ms.update
			) {
				this.trigger('update', [ clock, delta ]);
				this.__clock.update = clock;
			}


			var data;
			for (var iId in this.__intervals) {

				data = this.__intervals[iId];

				// Skip cleared intervals
				if (data === null) continue;

				var curStep = Math.floor((clock - data.start) / data.delta);
				if (curStep > data.step) {
					data.step = curStep;
					data.callback.call(data.scope, clock - data.start, curStep);
				}

			}


			for (var tId in this.__timeouts) {

				data = this.__timeouts[tId];

				// Skip cleared timeouts
				if (data === null) continue;

				if (clock >= data.start) {
					this.__timeouts[tId] = null;
					data.callback.call(data.scope, clock);
				}

			}

		}

	};


	return Class;

});

