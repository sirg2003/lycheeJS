
lychee.define('game.state.Editor').includes([
	'lychee.game.State',
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__logic = this.game.logic;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__drag = null;
		this.__level = null;
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
			}


			lychee.game.State.prototype.enter.call(this);

			this.__level = level;

			this.__locked = false;

			this.__input.bind('swipe',  this.__processSwipe, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('swipe', this.__processSwipe, this);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			this.__renderer.setAlpha(0.4);
			this.__renderer.renderPathCluster(this.__logic.path, this.game.layers.game);
			this.__renderer.setAlpha(1.0);


			if (this.__level !== null) {
				this.__renderer.renderLayer(this.__level.getEntities(), this.game.layers.game);
			}

		},


		__processSwipe: function(state, position, delta, swipeDelta) {

			if (this.__locked === true) return;

			this.game.offset(position);


			switch(state) {

				case 'start':
					this.__drag = this.__logic.getEntityByPosition(position);
				break;
				case 'move':

					if (this.__drag !== null) {
						this.__drag.setPosition(position);
						this.__logic.path.reset();
						this.__logic.path.generateCluster(this.__logic.getCells());
					}

				case 'end':

					if (this.__drag !== null && false) {
						this.__drag.setPosition(position);
						this.__drag = null;
					}

				break;

			}

		}

	};


	return Class;

});
