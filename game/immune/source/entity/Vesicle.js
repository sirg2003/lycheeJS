
lychee.define('game.entity.Vesicle').exports(function(lychee, global) {

	var _id = 0;

	var Class = function(cell, properties) {

		this.cell = cell;

		this.id = 'vesicle' + _id++;
		this.type = 'vesicle';
		this.team = 'neutral';

		this.health = 100;
		this.position = {
			x: 0, y: 0
		};

		lychee.extend(this, properties);

		this.__clock = null;

		this.__attackedBy = null;
		this.__health = this.health;

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */
		__sync: function(now) {
			this.__clock = now;
		},

		update: function(clock, delta) {

		},



		/*
		 * PUBLIC API
		 */
		getPosition: function() {
			return this.position;
		},

		setPosition: function(position) {

			this.position.x = position.x || this.position.x;
			this.position.y = position.y || this.position.y;


			return true;

		},

		damage: function(damage, team) {

			damage = typeof damage === 'number' ? damage : 0;

			this.health = Math.max(0, this.health - damage);
			this.__attackedBy = team;


			if (this.health === 0) {

				this.team = team;
				this.health = this.__health;

				this.__attackedBy = null;

			}

		},

		isAttackedBy: function(team) {
			return this.__attackedBy === team;
		},

		isTeam: function(team) {
			return this.team === team;
		}

	};


	return Class;

});

