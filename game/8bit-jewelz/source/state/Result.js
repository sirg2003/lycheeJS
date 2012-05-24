
lychee.define('game.state.Result').includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var _entityId = 0;

	var Class = function(game) {

		lychee.game.State.call(this, game, 'result');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__locked = true;

	};


	Class.prototype = {

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__locked = true;
			this.__entities = {};


			var width = this.game.settings.width;
			var height = this.game.settings.height;

			var font = this.game.fonts.headline;
			if (width < 400) {
				font = this.game.fonts.normal;
			}


			this.__entities.headline = new game.entity.Text(
				'GAME OVER',
				font, {
					position: {
						x: 'center',
						y: -160
					}
				}
			);

			this.__entities.headline.setTween(2000, {
				y: 100
			}, lychee.game.Entity.TWEEN.bounceEaseOut);


			var score = this.game.score.get('points');
			if (score === null) {
				score = '0';
			} else {
				score = score.toString();
			}

			this.__entities.points = new game.entity.Text(
				score + ' Points',
				font, {
					position: {
						x: 'center',
						y: height + 200
					}
				}
			);

   			this.__entities.points.setTween(2000, {
   				y: 160
   			}, lychee.game.Entity.TWEEN.bounceEaseOut);


			this.__entities.hint = new game.entity.Text(
				'Touch to get back to Menu',
				this.game.fonts.small, {
					position: {
						x: 'center',
						y: height + 100
					}
				}
			);


			this.__loop.timeout(2000, function() {

				this.__entities.hint.setTween(500, {
					y: height - 50
				}, lychee.game.Entity.TWEEN.easeOut);

			}, this);

			this.__loop.timeout(4000, function() {
				this.__locked = false;
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

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			for (var e in this.__entities) {

				if (this.__entities[e] === null) continue;
				this.__renderer.renderText(this.__entities[e]);

			}

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;
			this.game.setState('menu');

		}

	};


	return Class;

});
