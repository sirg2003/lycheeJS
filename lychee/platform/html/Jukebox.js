
lychee.define('Jukebox').tags({
	platform: 'html'
}).requires([
	'lychee.Track'
]).exports(function(lychee, global) {

	var Class = function(maxPoolSize) {

		this.__maxPoolSize = typeof maxPoolSize === 'number' ? maxPoolSize : 8;

		this.__tracks = {};
		this.__pool = {};
		this.__poolSize = 0;

	};


	Class.prototype = {

		add: function(track) {

			if (track instanceof lychee.Track) {
				this.__tracks[track.id] = track;
			}

		},

		play: function(id, loop) {

			if (this.__tracks[id] === undefined) {
				throw "Unknown Track ID, add the Track before playing.";
			}


			loop = loop === true ? true : false;


			var pId;
			var track;

			// Try to find an identical idling track
			for (pId in this.__pool) {

				track = this.__pool[pId];

				if (
					track.id === id
					&& track.isReady() === true
				) {
					track.play(loop);
					return true;
				}

			}


			// Try to use free pool space for playback
			if (this.__poolSize < this.__maxPoolSize) {
				pId = ++this.__poolSize;
				this.__pool[pId] = this.__tracks[id].clone();
				this.__pool[pId].play(loop);
				return true;
			}


			// No free poolspace? Overwrite an idling track with requested one
			for (pId in this.__pool) {

				track = this.__pool[pId];

				if (
					this.__poolSize === this.__maxPoolSize
					&& track.isReady() === true
				) {
					this.__pool[pId] = this.__tracks[id].clone();
					this.__pool[pId].play(loop);
					return true;
				}

			}

			// FIXME: No idling track in pool? What to do now?
			return false;

		},

		toggle: function(id, loop) {

			loop = loop === true ? true : false;

			if (this.isPlaying(id) === true) {
				this.stop(id);
			} else {
				this.play(id, loop);
			}

	   	},

		stop: function(id) {

			id = typeof id === 'string' ? id : null;

			for (var pId in this.__pool) {
				var track = this.__pool[pId];
				if (id === null || track.id === id) {
					track.stop();
				}
			}

		},

		mute: function(id) {

			id = typeof id === 'string' ? id : null;

			for (var pId in this.__pool) {
				var track = this.__pool[pId];
				if (id === null || track.id === id) {
					track.mute();
				}
			}

		},

		unmute: function(id) {

			id = typeof id === 'string' ? id : null;

			for (var pId in this.__pool) {
				var track = this.__pool[pId];
				if (id === null || track.id === id) {
					track.unmute();
				}
			}

		},

		isMuted: function(id) {

			id = typeof id === 'string' ? id : null;

			var anyTrackMuted = false;
			for (var pId in this.__pool) {
				var track = this.__pool[pId];
				if (
					(id === null || track.id === id)
					&& track.isMuted() === true
				) {
					anyTrackMuted = true;
				}
			}

			return anyTrackMuted;

		},

		isPlaying: function(id) {

			id = typeof id === 'string' ? id : null;

			var isPlaying = false;
			for (var pId in this.__pool) {
				var track = this.__pool[pId];
				if (
					(id === null || track.id === id)
					&& track.isIdle() === false
				) {
					isPlaying = true;
					break;
				}
			}

			return isPlaying;

		},

		getVolume: function(id) {

			var volume = 0;

			for (var pId in this.__pool) {
				var track = this.__pool[pId];
				if (track.id === id) {
					volume = Math.max(volume, track.getVolume());
				}
			}

			return volume;

		},

		setVolume: function(id, volume) {

			for (var pId in this.__pool) {
				var track = this.__pool[pId];
				if (track.id === id) {
					track.setVolume(volume);
				}
			}

		}

	};


	return Class;

});

