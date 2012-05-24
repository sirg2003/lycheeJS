
lychee.define('game.state.Campaign').includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var _campaign = game.campaign;

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__headline = null;
		this.__entities = {};
		this.__locked = false;


		this.__margin = {
			x: 50,
			y: 150
		};

		this.init();

	};


	Class.prototype = {

		init: function() {

			var width = this.game.settings.width;

			this.__entities.headline = new game.entity.Text(
				'Campaign',
				this.game.fonts.headline, {
					position: {
						x: 'center',
						y: -200
					}
				}
			);

			this.__entities.immuneheadline = new game.entity.Text(
				'Immune',
				this.game.fonts.headline, {
					position: {
						x: 100,
						y: 'center'
					}
				}
			);

			this.__entities.virusheadline = new game.entity.Text(
				'Virus',
				this.game.fonts.headline, {
					position: {
						x: width - 350,
						y: 'center'
					}
				}
			);


		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);


			this.__locked = true;

			this.__entities.headline.setPosition({
				y: -200
			});

			this.__entities.headline.setTween(500, {
				y: this.__margin.y - 100
			}, lychee.game.Entity.TWEEN.bounceEaseOut);


			this.__loop.timeout(1000, function() {
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

			this.__renderer.renderLayer(this.__entities);

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;

			var offset = this.game.getOffset(),
				width = this.game.settings.width,
				height = this.game.settings.height;


			position.x -= offset.x;
			position.y -= offset.y;


			if (position.x < width / 2) {
				this.game.settings.team = 'immune';
				this.game.setState('game', {
					type: 'campaign',
					id: 'Immune1'
				});
			} else {
				this.game.settings.team = 'virus';
				this.game.setState('game', {
					type: 'campaign',
					id: 'Virus1'
				});
			}

		}

	};


	return Class;

});

