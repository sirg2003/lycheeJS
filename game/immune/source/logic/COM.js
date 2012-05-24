
lychee.define('game.logic.COM').exports(function(lychee, global) {

	var Class = function(logic, team, base, mode, strength) {

		this.logic = logic;
		this.team = team || 'neutral';

		this.__base = base || { x: 0, y: 0 };
		this.__mode = null;
		this.__strength = null;
		this.__state = 'stopped';
		this.__vsTeam = this.team === 'virus' ? 'immune' : 'virus';

		this.reset(mode, strength);

	};


	Class.STRENGTH = {
		weak:       10000,
		normal:     5000,
		hard:       1000
		extreme:    200
	};


	Class.MODE = {
		passive:    0,
		defensive:  1,
		aggressive: 2
	};


	Class.prototype = {

		reset: function(mode, strength) {

			if (typeof mode === 'string' && Class.MODE[mode] !== undefined) {
				this.__mode = Class.MODE[mode];
			} else if (typeof mode === 'number') {
				this.__mode = mode;
			} else {
				this.__mode = Class.MODE.passive;
			}

			if (typeof strength === 'string' && Class.STRENGTH[strength] !== undefined) {
				this.__strength = Class.STRENGTH[strength];
			} else if (typeof strength === 'number') {
				this.__strength = strength;
			} else {
				this.__strength = Class.STRENGTH.weak;
			}

			this.__clock = null;
			this.__start = null;
			this.__lastAction = 0;

		},

		start: function() {
			this.__state = 'running';
		},

		stop: function() {
			this.__state = 'stopped';
		},

		__sync: function(clock) {
			this.__clock = clock;
			this.__start = clock;
			this.__lastAction = 0;
		},

		update: function(clock, delta) {

			if (this.__state !== 'running') return;
			if (this.__mode === Class.MODE.passive) return;


			if (this.__clock === null) {
				this.__sync(clock);
			} else {
				this.__clock = clock;
			}


			var currentAction = Math.floor((this.__clock - this.__start) / this.__strength);
			if (currentAction <= this.__lastAction) return;


			var unit = this.getIdlingUnit();
			if (unit === null) return;


			var cells = this.logic.getCells();
			var target = null;

			if (this.__mode === Class.MODE.defensive) {

				for (var c in cells) {

					var cell = cells[c];
					if (
						cell.isTeam(this.team) === false
						&& cell.isTeam(this.__vsTeam) === false
					) {
						target = this.__compareTarget(this.__base, target, cell);
					}

				}


			} else if (this.__mode === Class.MODE.aggressive) {

				if (this.team === 'neutral') {

					for (var c in cells) {

						var cell = cells[c];
						var vesicle = cell.getVesicle('virus');
						if (
							cell.isTeam('virus') === true
							&& cell.isAttackedBy('immune') === true
							&& vesicle !== null
						) {
							target = this.__compareTarget(this.__base, target, cell);
							break;
						}

					}

				} else {

					for (var c in cells) {

						var cell = cells[c];
						var rand = Math.random();

						if (
							cell.isTeam(this.team) === false
							&& (
								rand < 0.5 || cell.isTeam(this.__vsTeam) === true
							)
						) {
							target = this.__compareTarget(this.__base, target, cell);
							break;
						}

					}

				}

			}


			this.__lastAction = currentAction;


			if (target !== null) {
				this.logic.attackEnemy(unit, target);
			}

		},

		__compareTarget: function(position, cellA, cellB) {

			if (cellA === null) return cellB;

			var distanceA = Math.sqrt(Math.pow(position.x - cellA.position.x, 2) + Math.pow(position.y - cellA.position.y, 2));
			var distanceB = Math.sqrt(Math.pow(position.x - cellB.position.x, 2) + Math.pow(position.y - cellB.position.y, 2));

			if (distanceA < distanceB) {
				return cellA;
			} else {
				return cellB;
			}

		},

		getIdlingUnit: function() {

			var entities = this.logic.getUnits(this.team);
			for (var e in entities) {

				if (entities[e] === null) continue;

				var unit = entities[e];
				if (unit.isIdle && unit.isIdle() === true) {
					return unit;
				}

			}


			return null;

		}

	};


	return Class;

});

