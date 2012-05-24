
lychee.define('game.neutral.Leucocyte').includes([
	'game.entity.Unit'
]).exports(function(lychee, global) {

	var Class = function(properties) {

		properties = lychee.extend({
			team: 'neutral',
			damage: 100,
			health: 200,
			radius: 10,
			speed:  500
		}, properties);


		game.entity.Unit.call(this, properties);

		this.model = 'Leucocyte';
		this.info = null;
		this.type = 'unit';

	};


	Class.prototype = {

	};


	return Class;

});

