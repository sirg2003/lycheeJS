
lychee.define('game.immune.IgM').includes([
	'game.entity.Unit'
]).exports(function(lychee, global) {

	var Class = function(properties) {

		properties = lychee.extend({
			team: 'immune',
			damage: 40,
			health: 80,
			radius: 10,
			speed:  200
		}, properties);


		game.entity.Unit.call(this, properties);

		this.model = 'IgM';
		this.info = null;
		this.type = 'unit';

	};


	Class.prototype = {

	};


	return Class;

});

