
lychee.define('game.entity.Cell').requires([
	'game.entity.Vesicle'
]).exports(function(lychee, global) {

	var _id = 0;

	var Class = function(properties) {

		this.id = 'cell' + _id++;
		this.team = 'neutral';

		this.damage = 0;
		this.health = 100;

		this.radius = 200;
		this.position = {
			x: 0, y: 0
		};

		this.vesicles = {
			amount: 8,
			offset: 0
		};

		lychee.extend(this, properties);


		this.__clock = null;

		this.__attackedBy = null;
		this.__health = this.health;
		this.__fraction = {};
		this.__vesicles = {};
		this.__vesicleId = 0;


		this.getVesicles();

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */
		__sync: function(now) {
			this.__clock = now;
		},

		update: function(clock, delta) {

			if (this.__clock === null) {
				this.__sync(clock);
			}


			var team = this.team;
			var f = this.__fraction;

			f.neutral = 0;
			f.immune = 0;
			f.virus = 0;


			for (var v in this.__vesicles) {
				f[this.__vesicles[v].team]++;
			}


			if (f.immune + f.virus === this.vesicles.amount) {

				if (f.immune > f.virus) {
					team = 'immune';
				} else if (f.immune < f.virus) {
					team = 'virus';
				}

			} else if (f.immune + f.neutral === this.vesicles.amount) {

				if (f.immune > f.neutral) {
					team = 'immune';
				} else if (f.immune < f.neutral) {
					team = 'neutral';
				}

			}


			this.__clock = clock;

			if (this.team !== team) {
				this.reset(team);
			}

		},

		__compareVesicle: function(position, vesicleA, vesicleB) {

			if (vesicleA === null) return vesicleB;

			var distanceA = Math.sqrt(Math.pow(position.x - vesicleA.position.x, 2) + Math.pow(position.y - vesicleA.position.y, 2));
			var distanceB = Math.sqrt(Math.pow(position.x - vesicleB.position.x, 2) + Math.pow(position.y - vesicleB.position.y, 2));

			if (distanceA < distanceB) {
				return vesicleA;
			} else {
				return vesicleB;
			}

		},



		/*
		 * PUBLIC API
		 */
		reset: function(team, health) {

			team = typeof team === 'string' ? team : this.team;
			health = typeof health === 'number' ? health : 100;


			this.team = team;


			for (var v in this.__vesicles) {
				this.__vesicles[v].health = health;
			}

		},

		getPosition: function() {
			return this.position;
		},

		setPosition: function(position) {

			var offset = {
				x: position.x - this.position.x,
				y: position.y - this.position.y
			};

			offset.x = offset.x | 0;
			offset.y = offset.y | 0;


			for (var v in this.__vesicles) {

				var vesicle = this.__vesicles[v];
				var pos = vesicle.getPosition();

				vesicle.setPosition({
					x: pos.x + offset.x,
					y: pos.y + offset.y
				});

			}


			this.position.x += offset.x;
			this.position.y += offset.y;

		},

		getVesicles: function() {

			if (this.__vesicleId === 0 && this.vesicles.amount > 0) {

				for (var v = this.vesicles.offset; v < this.vesicles.offset + this.vesicles.amount; v++) {

					if (this.__vesicleId === 8) break;

					var position = {
						x: Math.sin(1/8 * Math.PI * 2 * v) * this.radius + this.position.x,
						y: Math.cos(1/8 * Math.PI * 2 * v) * this.radius + this.position.y
					};

					position.x = position.x | 0;
					position.y = position.y | 0;

					var vesicle = new game.entity.Vesicle(this, {
						position: position,
						team: this.team
					});

					this.__vesicles[this.__vesicleId++] = vesicle;

				}

			}


			return this.__vesicles;

		},

		getVesicle: function(team, position) {

			position = Object.prototype.toString.call(position) === '[object Object]' ? position : null;


			var vesicle = null;
			if (position === null) {

				for (var v in this.__vesicles) {
					if (this.__vesicles[v].isTeam(team) === true) {
						vesicle = this.__vesicles[v];
						break;
					}
				}

			} else {

				for (var v in this.__vesicles) {
					if (this.__vesicles[v].isTeam(team) === true) {
						vesicle = this.__compareVesicle(position, vesicle, this.__vesicles[v]);
					}
				}

			}


			return vesicle;

		},

		getVesicleById: function(id) {

			id = typeof id === 'number' ? id + '' : null;

			if (id === null) return null;


			for (var vId in this.__vesicles) {

				if (vId === id) {
					return this.__vesicles[vId];
				}

			}


			return null;

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

			for (var v in this.__vesicles) {

				if (this.__vesicles[v].isAttackedBy(team) === true) {
					return true;
				}

			}


			return this.__attackedBy === team;

		},

		isTeam: function(team) {
			return this.team === team;
		}

	};


	return Class;

});

