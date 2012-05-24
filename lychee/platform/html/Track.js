
lychee.define('Track').tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var _mime = {
		'3gp':  [ 'audio/3gpp' ],
		'aac':  [ 'audio/aac', 'audio/aacp' ],
		'amr':  [ 'audio/amr' ],
		'caf':  [ 'audio/x-caf', 'audio/x-aiff; codecs="IMA-ADPCM, ADPCM"' ],
		'm4a':  [ 'audio/mp4; codecs=mp4a' ],
		'mp3':  [ 'audio/mpeg' ],
		'mp4':  [ 'audio/mp4' ],
		'ogg':  [ 'application/ogg', 'audio/ogg', 'audio/ogg; codecs=theora, vorbis' ],
		'wav':  [ 'audio/wave', 'audio/wav', 'audio/wav; codecs="1"', 'audio/x-wav', 'audio/x-pn-wav' ],
		'webm': [ 'audio/webm', 'audio/webm; codecs=vorbis' ]
	};

	var _codecs = {};
	var _audio = null;
	if (global.Audio) {
		_audio = new Audio();
	}

	if (_audio !== null) {

		for (var ext in _mime) {

			var data = _mime[ext];
			for (var d = 0, l = data.length; d < l; d++) {
				if (_audio.canPlayType(data[d])) {
					_codecs[ext] = data[d];
				} else if (_codecs[ext] === undefined) {
					_codecs[ext] = false;
				}
			}

		}

	}


	if (lychee.debug === true) {

		var _supportedFormats = [];
		for (var ext in _codecs) {
			if (_codecs[ext] !== false) {
				_supportedFormats.push(ext);
			}
		}

		console.log("Supported media formats: " + _supportedFormats.join(', '));

	}


	var Class = function(id, settings, isReady) {

		isReady = isReady === true ? true : false;

		if (_audio === null) {
			throw "Your Browser does not support HTML5 Audio.";
		}

		this.id = id;
		this.settings = lychee.extend({}, this.defaults, settings);

		this.__isIdle = true;
		this.__isLooping = false;
		this.__isMuted = false;
		this.__isReady = isReady;


		var playableFormat = null;
		for (var f = 0, l = this.settings.formats.length; f < l; f++) {

			var format = this.settings.formats[f];
			if (
				playableFormat === null
				&& _codecs[format] !== false
			) {
				playableFormat = format;
			}

		}

		if (playableFormat === null) {

			throw "Your Browser does only support these formats: " + _supportedFormats.join(', ');

		} else {

			this.__audio = new Audio(this.settings.base + '.' + playableFormat);
			this.__audio.autobuffer = true;
			this.__audio.load();


			var that = this;
			this.__audio.addEventListener('ended', function() {
				if (that.__isLooping === true) {
					that.play(true);
				} else {
					that.__isIdle = true;
				}
			}, true);


			if (isReady === false) {

				this.__audio.addEventListener('canplaythrough', function() {
					that.__isReady = true;
				}, true);

			}

		}

	};


	Class.prototype = {

		defaults: {
			base: null,
			formats: []
		},

		__resetPointer: function() {

			try {
				this.__audio.currentTime = 0;
			} catch(e) {
			}

		},

		play: function(loop) {

			loop = loop === true ? true : false;


			if (this.__isReady === true) {

				this.__audio.play();
				this.__isIdle = false;
				this.__isLooping = loop;

				this.__resetPointer();

			}

		},

		stop: function() {

			this.__isIdle = true;
			this.__isLooping = false;

			this.__audio.pause();
			this.__resetPointer();

		},

		pause: function() {
			this.__audio.pause();
		},

		resume: function() {
			this.__audio.play();
		},

		mute: function() {

			if (this.__isMuted === false) {

				this.__unmuteVolume = this.__audio.volume;
				this.__audio.volume = 0;
				this.__isMuted = true;

				return true;

			}

			return false;

		},

		unmute: function() {

			if (this.__isMuted === true) {

				this.__audio.volume = this.__unmuteVolume || 1;
				this.__isMuted = false;

				return true;

			}

			return false;

		},

		getVolume: function() {
			return this.__audio.volume;
		},

		setVolume: function(volume) {

			var newVolume = Math.min(Math.max(0, volume), 1);
			this.__audio.volume = newVolume;

			if (newVolume === volume) {
				return true;
			}

			return false;

		},

		clone: function() {

			var id = this.id;
			var settings = lychee.extend({}, this.settings);

			return new lychee.Track(id, settings, true);

		},

		isIdle: function() {
			return this.__isIdle === true;
		},

		isMuted: function() {
			return this.__isMuted === true;
		},

		isReady: function() {
			return this.__isIdle === true && this.__isReady === true;
		}

	};


	return Class;

});

