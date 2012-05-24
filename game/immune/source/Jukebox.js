
lychee.define('game.Jukebox').includes([
	'lychee.game.Jukebox'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.Jukebox.call(this, 20, game.loop);

		this.game = game;

		var base = game.settings.base + '/snd';
		var formats = [ 'caf', 'mp3', 'ogg' ];

		var tracks = [
			// Unit
			'moving-out',
			'yes-sir',
			'awaiting-orders',
			'unit-reporting',

			// Flood
			'enemy-approaching',
			'unit-ready',
			'reinforcements-have-arrived'
		];


		for (var t = 0, l = tracks.length; t < l; t++) {

			try {

				var track = new lychee.Track(tracks[t], {
					base: base + '/' + tracks[t],
					formats: formats
				});

				this.add(track);

			} catch(e) {

				if (lychee.debug === true) {
					console.warn(e);
				}

			}

		}


		this.__unitSounds = {
			attack: [ 'yes-sir' ],
			move: [ 'moving-out' ],
			ready: [ 'awaiting-orders', 'unit-reporting' ]
		};

	};


	Class.prototype = {

		play: function(track, loop) {

			if (this.game.settings.sound !== true) return;

			try {

				lychee.game.Jukebox.prototype.play.call(this, track, loop);

			} catch(e) {

				if (lychee.debug === true) {
					console.warn(e);
				}

			}

		},

		playUnitSound: function(type) {

			if (this.game.settings.sound !== true) return;

			type = typeof type === 'string' ? type : null;


			if (type !== null && Object.prototype.toString.call(this.__unitSounds[type]) === '[object Array]') {

				var track = this.__unitSounds[type][Math.round(Math.random() * (this.__unitSounds[type].length - 1))];
				this.play(track);

			}

		}

	};


	return Class;

});

