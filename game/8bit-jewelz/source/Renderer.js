
lychee.define('game.Renderer').requires([
	'game.entity.Jewel',
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

		defaults: {
			sprite: null,
			map: null,
			tile: 0
		},

		reset: function(width, height, resetCache, settings) {

			lychee.Renderer.prototype.reset.call(this, width, height, resetCache);

			if (Object.prototype.toString.call(settings) === '[object Object]') {
				this.settings = lychee.extend({}, this.settings, settings);
			}

		},

		clock: function(clock, delta) {
			this.__clock = clock;
			this.__delta = delta;
		},

		renderJewel: function(entity) {

			var map = this.settings.map['jewel-' + entity.getColor()];
			var tile = this.settings.tile;
			var sprite = this.settings.sprite;

			if (!sprite instanceof Image) return;

			var pos = entity.getPosition();

			this.__ctx.drawImage(
				sprite,
				map.x * tile,
				map.y * tile,
				tile,
				tile,
				pos.x - tile / 2,
				pos.y - tile / 2,
				tile,
				tile
			);

		},

		renderText: function(entity) {

			var pos = entity.getPosition();
			this.drawText(entity.text, pos.x, pos.y, entity.font, null);

		}

	};


	return Class;

});

