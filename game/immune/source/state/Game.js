
lychee.define('game.state.Game').requires([
	'game.Statusbar'
]).includes([
	'lychee.game.State',
]).exports(function(lychee, global) {

	var _game = game;

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__logic = this.game.logic;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__statusbar = new _game.Statusbar(this.game);

		this.__drag = { x: 0, y: 0 };
		this.__level = null;
		this.__type = null;
		this.__id = null;
		this.__locked = false;

	};


	Class.prototype = {

		enter: function(data) {

			data = Object.prototype.toString.call(data) === '[object Object]' ? data : null;

			if (data === null) {
				this.game.setState('menu');
				return;
			}


			this.__logic.reset();

			var level = this.__logic.createLevel(data.type, data.id);
			if (level === null) {
				this.game.setState('menu');
				return;
			} else {
				this.__type = data.type;
				this.__id = data.id;
			}


			lychee.game.State.prototype.enter.call(this);


			this.__logic.bind('select', function(entity) {
				this.__statusbar.setSelection(entity);
			}, this);

			this.__level = level;
			this.__level.bind('objective', function(objective) {
				this.__statusbar.setObjective(objective);
			}, this);

			this.game.layers.game.offset.x = 0;
			this.game.layers.game.offset.y = 0;

			this.__level.start();
			this.__locked = false;


			this.__input.bind('touch', this.__processTouch, this);
			this.__input.bind('swipe', this.__processSwipe, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch, this);
			this.__input.unbind('swipe', this.__processSwipe, this);

			this.__logic.unbind('select');
			this.__level.unbind('objective');

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			if (this.__level !== null) {

				this.__level.update(clock, delta);

				if (this.__level.isComplete() === true) {

					this.game.setState('gameover', {
						level: this.__level,
						type: this.__type,
						id: this.__id
					});

				}

			}

			if (this.__statusbar !== null) {
				this.__statusbar.update(clock, delta);
			}

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			this.__renderer.sync(clock, delta);

			if (lychee.debug === true) {
				this.__renderer.setAlpha(0.4);
				this.__renderer.renderPathCluster(this.__logic.path, this.game.layers.game);
				this.__renderer.setAlpha(1.0);
			}


			if (this.__level !== null) {

				this.__renderer.renderLayer(this.__level.getEntities(), this.game.layers.game);

				var selected = this.__logic.getSelected();
				if (selected !== null) {
					this.__renderer.renderSelected(selected, this.game.layers.game);
				}

			}

			if (this.__statusbar !== null) {
				this.__statusbar.render(clock, delta);
			}

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;

			this.game.offset(position, this.game.layers.game);

			this.__logic.touch(position);

		},

		__processSwipe: function(state, position, delta, swipe) {

			this.game.offset(position);


			var layer = this.game.layers.game;

			switch (state) {

				case 'start':
					this.__drag.x = layer.offset.x;
					this.__drag.y = layer.offset.y;
				break;

				case 'move':

					var x = this.__drag.x + swipe.x;
					var y = this.__drag.y + swipe.y;


					if (this.__level !== null) {

						if (this.__level.width < layer.width) {
							x = Math.max(Math.min(layer.width - this.__level.width, x), 0);
						} else {
							x = Math.min(Math.max(layer.width - this.__level.width, x), 0);
						}

						if (this.__level.height < layer.height) {
							y = Math.max(Math.min(layer.height - this.__level.height, y), 0);
						} else {
							y = Math.min(Math.max(layer.height - this.__level.height, y), 0);
						}


					}


					layer.offset.x = x;
					layer.offset.y = y;

				break;

				case 'end':
				break;

			}

		}

	};


	return Class;

});
