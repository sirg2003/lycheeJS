
lychee.define('game.entity.Jewel').includes([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		if (this.settings.color === null) {
			this.settings.color = this.getRandomColor();
		}

		lychee.game.Entity.call(this, this.settings);

	};


	Class.COLORS = {

		red:    'red',
		orange: 'orange',
		yellow: 'yellow',
		white:  'white',
		blue:   'blue',
		green:  'green',
		purple: 'purple',

		length: 7
	};


	Class.prototype = {

		defaults: {
			color: null
		},

		getRandomColor: function() {

			var rand = Math.floor(Math.random() * Class.COLORS.length);

			var count = 0;
			for (var id in Class.COLORS) {
				if (count === rand) {
					return id;
					break;
				}
				count++;
			}

		},

		getColor: function() {
			return this.settings.color || Class.COLORS.red;
		},

		setColor: function(color) {
			this.settings.color = color || Class.COLORS.red;
		}

	};


	return Class;

});

