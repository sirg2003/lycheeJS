
lychee.define('game.state.Credits').includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__renderer = this.game.renderer;

		this.__credits = null;
		this.__pxPerSecond = 20;

	};


	Class.prototype = {

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			var height = this.game.settings.height;

			this.__credits = [];
			this.__pxPerSecond = height / 20;

			this.__credits.push({
				text: 'Music and Sound',
				font: this.game.fonts.normal,
				x: 'center',
				y: -40
			});

			this.__credits.push({
				text: 'created with Milkytracker',
				font: this.game.fonts.small,
				x: 'center',
				y: -(40 + 20)
			});

			this.__credits.push({
				text: 'Art',
				font: this.game.fonts.normal,
				x: 'center',
				y: -(40 * 4)
			});

			this.__credits.push({
				text: 'created with Inkscape',
				font: this.game.fonts.small,
				x: 'center',
				y: -(40 * 4 + 20)
			});

			this.__credits.push({
				text: 'Game',
				font: this.game.fonts.normal,
				x: 'center',
				y: -(40 * 7)
			});

			this.__credits.push({
				text: 'created with LycheeJS',
				font: this.game.fonts.small,
				x: 'center',
				y: -(40 * 7 + 20)
			});

			this.__credits.push({
				text: 'Christoph Martens',
				font: this.game.fonts.normal,
				x: 'center',
				y: -(40 * 7 + height)
			});

			this.__credits.push({
				text: 'by',
				font: this.game.fonts.small,
				x: 'center',
				y: -(40 * 7 + height + 20)
			});

			this.__credits.push({
				text: 'LycheeJS',
				font: this.game.fonts.normal,
				x: 'center',
				y: -(40 * 10 + height)
			});

			this.__credits.push({
				text: 'martensms@github.com',
				font: this.game.fonts.small,
				x: 'center',
				y: -(40 * 10 + height + 20)
			});


			if (this.game.settings.music === true) {
				this.game.jukebox.fadeIn('music', 2000, true, 0.5);
			}

			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			if (this.game.jukebox.isPlaying('music')) {
				this.game.jukebox.fadeOut('music', 2000);
			}

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			if (this.__credits !== null) {

				var height = this.game.settings.height;
				var last = this.__credits[this.__credits.length - 1];
				if (last.y > height / 4) {
					return;
				}

				var px = (delta / 1000) * this.__pxPerSecond;
				for (var c = 0; c < this.__credits.length; c++) {
					this.__credits[c].y += px;
				}

			}

		},

		render: function() {

			this.__renderer.clear();

			if (this.__credits !== null) {

				for (var c = 0; c < this.__credits.length; c++) {

					var credit = this.__credits[c];

					this.__renderer.drawText(
						credit.text,
						credit.x,
						Math.floor(credit.y),
						credit.font || this.game.fonts.normal,
						null
					);

				}

			}


			this.__renderer.drawText(
				'powered by lycheeJS',
				'center',
				this.game.settings.height - 40,
				this.game.fonts.small,
				null
			);

		},

		__processTouch: function(position, delta) {
			this.game.setState('menu');
		}

	};


	return Class;

});
