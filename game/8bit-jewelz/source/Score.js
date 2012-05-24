
lychee.define('game.Score').includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var Class = function() {

		this.data = {
			points: 0,
			time:   0
		};

		lychee.Events.call(this, 'score');

	};


	Class.prototype = {

		get: function(key) {
			return this.data[key] || null;
		},

		set: function(key, value) {
			this.data[key] = value;
			this.trigger('update', [ this.data ]);
		},

		add: function(key, value) {

			if (this.data[key] === undefined) {
				this.data[key] = 0;
			}

			this.data[key] += value;
			this.trigger('update', [ this.data ]);

		},

		substract: function(key, value) {

			if (this.data[key] === undefined) {
				this.data[key] = 0;
			}

			this.data[key] -= value;
			this.trigger('update', [ this.data ]);

		}

	};


	return Class;

});

