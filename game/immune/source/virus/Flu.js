
lychee.define('game.virus.Flu').includes([
	'game.entity.Unit'
]).exports(function(lychee, global) {

	var Class = function(properties) {

		properties = lychee.extend({
			team: 'virus',
			color: '#f00',
			damage: 30,
			health: 50,
			radius: 10,
			speed:  300
		}, properties);


		game.entity.Unit.call(this, properties);

		this.model = 'Flu';
		this.info = null;
		this.type = 'unit';

	};


	Class.prototype = {

	};


	return Class;

});

