
lychee.define('lychee.game.Jukebox').requires([
	'lychee.game.Loop'
]).includes([
	'lychee.Jukebox'
]).exports(function(lychee, global) {

	var Class = function(maxPoolSize, loop) {

		lychee.Jukebox.call(this, maxPoolSize);

		if (loop instanceof lychee.game.Loop) {
			loop.bind('update', this.update, this);
		}

		this.__clock = 0;
		this.__effects = {};
		this.__effectId = 0;

	};


	Class.prototype = {

		update: function(t, dt) {

			for (var e in this.__effects) {

				var effect = this.__effects[e];
				if (effect === null) continue;

				var pos = (this.__clock - effect.start) / (effect.end - effect.start);

				if (effect.end <= this.__clock) {

					if (effect.type === 'fade-out') {
						this.stop(effect.id);
					}

					this.__effects[e] = null;
					continue;

				}


				if (effect.type === 'fade-in') {
					this.setVolume(effect.id, pos * effect.diff);
				} else if (effect.type === 'fade-out') {
					this.setVolume(effect.id, (1 - pos) * effect.diff);
				}

			}

			this.__clock = t;

		},

		fadeIn: function(id, time, loop, volume) {

			loop = loop === true ? true : false;
			time = typeof time === 'number' ? time : 0;
			volume = typeof volume === 'number' ? volume : 1;

			this.play(id, loop);
			this.setVolume(id, 0);

			var effect = {
				id: id,
				type: 'fade-in',
				start: this.__clock,
				end: this.__clock + time,
				diff: volume
			};

			this.__effects[++this.__effectId] = effect;

		},

		fadeOut: function(id, time) {

			time = typeof time === 'number' ? time : 0;

			var currentVolume = this.getVolume(id);

			var effect = {
				id: id,
				type: 'fade-out',
				start: this.__clock,
				end: this.__clock + time,
				diff: currentVolume
			};

			this.__effects[++this.__effectId] = effect;

		},

		removeEffects: function(id) {

			for (var e in this.__effects) {
				if (this.__effects[e] !== null && this.__effects[e].id === id) {
					this.__effects[e] = null;
				}
			}

		}

	};


	return Class;

});

