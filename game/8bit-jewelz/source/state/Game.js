
lychee.define('game.state.Game').includes([
	'lychee.game.State',
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__board = this.game.board;
		this.__sidebar = this.game.sidebar;
		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;
		this.__score = this.game.score;

		this.__clock = 0;
		this.__hintTimeout = null;

		this.init();

	};


	Class.prototype = {

		init: function() {

			this.__intro = new game.entity.Text(
				'3',
				this.game.fonts.headline, {
					position: {
						x: 'center',
						y: 'center'
					}
				}
			);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__hintTimeout = null;
			this.__locked = true;

			if (this.game.settings.music === true) {
				this.game.jukebox.fadeIn('music', 2000, true, 0.5);
			}

			if (this.game.settings.sound === true) {
				this.game.jukebox.play('countdown');
			}

			this.__board.reset();
			this.__sidebar.enter();

			this.__score.set('time',   this.game.settings.play.time);
			this.__score.set('points', 0);

			this.__input.bind('touch', this.__processTouch, this);

			this.__renderer.start();


			this.__loop.timeout(0, function(clock, delta) {
				this.__intro.setText('3');
				this.__introTimeout = clock + this.game.settings.play.intro;
			}, this);

			this.__loop.timeout(1000, function() {
				this.__intro.setText('2');
			}, this);

			this.__loop.timeout(2000, function() {
				this.__intro.setText('1');
			}, this);

			this.__loop.timeout(3000, function() {
				this.__intro.setText('Go!');
			}, this);

			this.__loop.timeout(4000, function() {
				this.__introTimeout = null;
				this.__locked = false;
			}, this);

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			this.__sidebar.leave();

			if (this.game.jukebox.isPlaying('music')) {
				this.game.jukebox.fadeOut('music', 2000);
			}

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			var entities = this.__board.all();
			for (var e in entities) {
				if (entities[e] === null) continue;
				entities[e].update(clock, delta);
			}


			if (this.__locked === false) {

				this.__score.substract('time', delta);

				if (this.__score.get('time') < 0) {
					this.game.setState('result');
				}

			}

			if (this.__hintTimeout !== null && this.__hintTimeout < this.__clock) {
				this.__board.activateHint();
				this.__hintTimeout = null;
			}

			this.__clock = clock;

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			this.__renderer.clock(clock, delta);

			if (this.__introTimeout !== null) {
				this.__renderer.context.getContext('2d').globalAlpha = 0.2;
			}

			var entities = this.__board.all();
			for (var e in entities) {

				if (entities[e] === null) continue;
				this.__renderer.renderJewel(entities[e]);

			}


			this.__sidebar.render(clock, delta);

			if (this.__introTimeout !== null) {
				this.__renderer.context.getContext('2d').globalAlpha = 1;
			}


 			if (this.__introTimeout !== null) {
				this.__renderer.renderText(this.__intro);
			}

		},

		__translatePosition: function(position, px) {

			px = px === true ? true : false;

			var offset = this.game.getOffset();
			var tile = this.game.board.settings.tile;

			position.x -= offset.x;
			position.y -= offset.y;

			position.x /= tile;
			position.y /= tile;

			// Board is 0-indexed
			position.x = Math.floor(position.x);
			position.y = Math.floor(position.y);

			if (px === true) {

				position.x *= tile;
				position.y *= tile;

			}

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;

			this.__translatePosition(position);

			this.__board.touch(position.x, position.y);
            this.__hintTimeout = this.__clock + this.game.settings.play.hint;

		}

	};


	return Class;

});
