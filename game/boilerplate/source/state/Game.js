
lychee.define('game.state.Game').includes([
	'lychee.game.State',
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__clock = 0;
		this.__entities = {};
		this.__locked = false;

		this.init();

	};


	Class.prototype = {

		init: function() {

			this.__entities.intro = new game.entity.Text(
				'Game State active',
				this.game.fonts.normal, {
					position: {
						x: 'center',
						y: -200
					}
				}
			);

			var height = this.game.settings.height;

			this.__entities.hint = new game.entity.Text(
				'Touch to make Noise',
				this.game.fonts.small, {
					position: {
						x: 'center',
						y: height + 200
					}
				}
			);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);


			var height = this.game.settings.height;

			this.__locked = true;

			this.__entities.intro.setPosition({
				y: -200
			});

			this.__entities.intro.setTween(1500, {
				y: height / 2 - 50
			}, lychee.game.Entity.TWEEN.easeOut);

			this.__entities.hint.setPosition({
				y: height + 200
			});

			this.__loop.timeout(1000, function() {

				this.__locked = false;

				this.__entities.hint.setTween(500, {
					y: height - 50
				}, lychee.game.Entity.TWEEN.easeOut);

			}, this);


			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			for (var e in this.__entities) {
				if (this.__entities[e] === null) continue;
				this.__entities[e].update(clock, delta);
			}

			this.__clock = clock;

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			this.__renderer.clock(clock, delta);

			for (var e in this.__entities) {
				if (this.__entities[e] === null) continue;
				this.__renderer.renderText(this.__entities[e]);
			}

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;

			if (this.game.settings.sound === true) {
				this.game.jukebox.play('click');
			}

		}

	};


	return Class;

});
