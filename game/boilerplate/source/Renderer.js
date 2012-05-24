
lychee.define('game.Renderer').requires([
	'game.entity.Text'
]).includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.Renderer.call(this);

		this.settings = lychee.extend({}, this.defaults);

		this.__clock = 0;
		this.__delta = 0;

	};

	Class.prototype = {

		clock: function(clock, delta) {
			this.__clock = clock;
			this.__delta = delta;
		},

		renderText: function(entity) {

			var pos = entity.getPosition();
			this.drawText(entity.text, pos.x, pos.y, entity.font, null);

		}

	};


	return Class;

});

