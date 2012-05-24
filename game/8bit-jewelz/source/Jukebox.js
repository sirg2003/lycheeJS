
lychee.define('game.Jukebox').includes([
	'lychee.game.Jukebox'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.Jukebox.call(this, 20, game.loop);

		var base = game.settings.base + '/snd';
		var formats = [ 'caf', 'mp3', 'ogg', 'gsm', 'amr' ];

		var tracks = [
			// state.Game
			'countdown',
			'success',
			'fail',
			// state.Menu
			'menuclick',
			// Music
			'music'
		];


		for (var t = 0, l = tracks.length; t < l; t++) {

			var track = new lychee.Track(tracks[t], {
				base: base + '/' + tracks[t],
				formats: formats
			});

			this.add(track);

		}

	};


	return Class;

});

