
lychee.define('game.immune.BLymphocyte').includes([
	'game.entity.Cell',
	'game.entity.Unit'
]).exports(function(lychee, global) {

	var Class = function(properties) {

		properties = lychee.extend({
			team: 'immune',
			damage: 1,
			health: 100,
			radius: 25,
			speed:  100
		}, properties);


		game.entity.Unit.call(this, properties);

		// FIXME: This should be done via mutation
		this.model = 'BLymphocyte';
		this.info = 'B-L';
		this.type = 'unit';


		this.__antigen = null;
		this.__mutation = null;
		this.__production = null;
		this.__properties = properties;

	};


	Class.prototype = {

		settings: {
			duration: {
				production: 10000,
				mutation: 10000
			}
		},

		// TODO: Evaluate if mutation target radius is necessary
		// to be configurable or not, depends on level scenarios
		//
		// FIXME: Antigen activation or directly via Unit model?
		// Kinda mixed up atm.

		activate: function(antigen) {

			if (this.__antigen === null) {

				this.type = 'cell';
				this.__antigen = antigen;

				this.__mutation = {
					start: this.__clock,
					from: {
						radius: this.radius,
						health: this.health
					},
					to: {
						radius: 100,
						health: 300
					},
					duration: this.settings.duration.mutation
				};

				game.entity.Cell.call(this, this.__properties);

				return true;

			}


			return false;

		},

		getProduction: function(stop) {

			stop = stop === true ? true : false;

			if (this.type === 'cell') {

				if (stop === true) {
					var production = this.__production;
					this.__production = null;
					return production;
				} else {
					return this.__production;
				}

			}


			return null;

		},

		startProduction: function() {

			this.__production = {
				duration: this.settings.duration.production,
				ready: false,
				model: this.__antigen,
				start: this.__clock
			};

		},

		__updateVesicles: function(health) {

			var vId = 0;
			for (var v = this.vesicles.offset; v < this.vesicles.offset + this.vesicles.amount; v++) {

				var position = {
					x: Math.sin(1/8 * Math.PI * 2 * v) * this.radius + this.position.x,
					y: Math.cos(1/8 * Math.PI * 2 * v) * this.radius + this.position.y
				};

				position.x = position.x | 0;
				position.y = position.y | 0;

				this.__vesicles[vId].health = health;
				this.__vesicles[vId].setPosition(position);

				vId++;

			}

		},

		update: function(clock, delta) {


			if (
				this.__mutation !== null
				&& (this.__clock <= this.__mutation.start + this.__mutation.duration)
				&& this.__mutation.duration !== 0
			) {

				game.entity.Cell.prototype.update.call(this, clock, delta);


				var t = (this.__clock - this.__mutation.start) / this.__mutation.duration;

				for (var prop in this.__mutation.from) {
					var value = this.__mutation.from[prop] + t * (this.__mutation.to[prop] - this.__mutation.from[prop]);
					this[prop] = value + Math.sin(t * 6 * Math.PI) * (value / 10);
				}


				this.__updateVesicles((t * 100) | 0);

			} else if (this.__mutation !== null) {

				game.entity.Cell.prototype.update.call(this, clock, delta);

				for (var prop in this.__mutation.to) {
					this[prop] = this.__mutation.to[prop];
				}

				this.__mutation = null;

				this.startProduction();

			} else {

				if (this.type === 'unit') {

					game.entity.Unit.prototype.update.call(this, clock, delta);

				} else if (this.type === 'cell') {

					game.entity.Cell.prototype.update.call(this, clock, delta);


					if (
						this.__production !== null
						&& this.__clock > this.__production.start + this.__production.duration
						&& this.__production.ready !== true
					) {

						this.__production.ready = true;

					}

				}

			}

		},

		isReady: function() {

			if (this.__mutation === null && this.type === 'cell') {
				return true;
			}


			return false;

		}

	};


	return Class;

});

