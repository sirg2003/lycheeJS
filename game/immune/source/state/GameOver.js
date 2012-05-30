
lychee.define('game.state.GameOver').includes([
	'lychee.game.State',
]).exports(function(lychee, global) {

	var _game = game;

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__background = null;
		this.__nextLevel = null;
		this.__locked = false;
		this.__entities = {};

		this.init();

	};


	Class.prototype = {

		init: function() {

			this.__entities.state = {};

			this.__entities.state.headline = new game.entity.Text(
				'Game Over',
				this.game.fonts.headline, {
					position: {
						x: 'center',
						y: -200
					}
				}
			);

			this.__entities.state.subtitle = new game.entity.Text(
				'Congratulations',
				this.game.fonts.normal, {
					position: {
						x: 'center',
						y: -200
					}
				}
			);

			this.__entities.state.touch = new game.entity.Text(
				'Touch to go back to Menu',
				this.game.fonts.small, {
					position: {
						x: 'center',
						y: -200
					}
				}
			);

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);

			if (Object.prototype.toString.call(data) !== '[object Object]') {
				this.game.setState('menu');
				return;
			}


			var width = this.game.settings.width;
			var height = this.game.settings.height;


			this.__background = null;
			this.__entities.statistics = {};
			this.__locked = true;


			// HINT: Offset is required for timing after statistics are faded in
			var offset = 0;
			if (data.level !== null) {

				this.__background = new Image();
				this.__background.src = this.__renderer.context.toDataURL('image/png');


				var statistics = data.level.getStatistics();


				for (var s in statistics) {

					var objective = statistics[s];


					this.__entities.statistics[s + '-description'] = new game.entity.Text(
						objective.description,
						this.game.fonts.small, {
							position: {
								x: -1 * width,
								y: 240 + offset * 40
							}
						}
					);


					var text = '';
					if (objective.completed === true) {
						text += Math.round((objective.end - objective.start) / 1000) + ' s';
					} else {
						text += '-';
					}

					this.__entities.statistics[s + '-result'] = new game.entity.Text(
						text,
						this.game.fonts.small, {
							position: {
								x: 2 * width,
								y: 240 + offset * 40
							}
						}
					);


					(function(that, description, result) {

						that.__loop.timeout(1500 + offset * 500, function() {

							description.setTween(500, {
								x: 100
							}, lychee.game.Entity.TWEEN.bounceEaseOut);

							result.setTween(500, {
								x: width - 100
							}, lychee.game.Entity.TWEEN.bounceEaseOut);

						}, that);

					})(this, this.__entities.statistics[s + '-description'], this.__entities.statistics[s + '-result']);

					offset++;

				}

			}


			var id = null;
			var type = null;

			if (data.type !== null && data.id !== null) {

				var id = data.id;
				var type = data.type;
				if (parseInt(id.substr(id.length - 1, 1), 10) !== NaN) {

					var coffset = 0;
					for (var i = 0, l = id.length; i < l; i++) {

						if (id.substr(i, 1).match(/[0-9]/)) {
							coffset = i;
							break;
						}

					}

				}


				var num = parseInt(id.substr(coffset, id.length - coffset), 10) + 1;

				id = id.substr(0, coffset) + num;

			}


			if (id !== null && type !== null && _game[type][id] instanceof Function) {

				this.__entities.state.touch.setText('Touch to start next Level');
				this.__nextLevel = {
					type: type,
					id: id
				};

			} else {

				this.__entities.state.touch.setText('Touch to go back to Menu');
				this.__nextLevel = null;

			}


			var entities = this.__entities.state;

			entities.headline.setPosition({
				y: -200
			});

			entities.subtitle.setPosition({
				y: height + 200
			});

			entities.touch.setPosition({
				y: height + 200
			});



			entities.headline.setTween(500, {
				y: 50
			}, lychee.game.Entity.TWEEN.bounceEaseOut);


			this.__loop.timeout(1000, function() {

				entities.subtitle.setTween(500, {
					y: 110
				}, lychee.game.Entity.TWEEN.bounceEaseOut);

				this.__loop.timeout(1500 + offset * 500, function() {

					entities.touch.setTween(500, {
						y: this.game.settings.height - 40
					});

					this.__locked = false;

				}, this);

			}, this);

			this.__input.bind('touch',  this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch',  this.__processTouch, this);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {


			var e, entities;

			entities = this.__entities.state;
			for (e in entities) {
				if (entities[e] === null) continue;
				entities[e].update(clock, delta);
			}


			entities = this.__entities.statistics;
			for (e in entities) {
				if (entities[e] === null) continue;
				entities[e].update(clock, delta);
			}

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			if (this.__background !== null) {

				this.__renderer.drawSprite(
					this.__background,
					0,
					0
				);


				this.__renderer.setAlpha(0.7);

				this.__renderer.drawBox(
					0,
					0,
					this.game.settings.width,
					this.game.settings.height,
					'#000',
					true
				);

				this.__renderer.setAlpha(1);

			}


			this.__renderer.renderLayer(this.__entities.state);
			this.__renderer.renderLayer(this.__entities.statistics);

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;


			if (this.__nextLevel === null) {
				this.game.setState('menu');
			} else {
				this.game.setState('game', this.__nextLevel);
			}

		}

	};


	return Class;

});

