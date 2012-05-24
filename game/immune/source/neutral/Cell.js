
lychee.define('game.neutral.Cell').includes([
	'game.entity.Cell'
]).exports(function(lychee, global) {

	var Class = function(properties) {

		properties = lychee.extend({
			team: 'neutral',
			damage: 0,
			radius: 100
		}, properties);


		game.entity.Cell.call(this, properties);

		this.type = 'cell';

	};


	Class.prototype = {

	};


	return Class;

});

