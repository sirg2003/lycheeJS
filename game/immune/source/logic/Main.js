
lychee.define('game.logic.Main').requires([
	'game.logic.Path'
]).includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var _logic = game.logic;

	var Class = function(game) {

		this.game = game;
		this.loop = this.game.loop;

		this.path = new _logic.Path(this.game);

		this.__renderer = this.game.renderer;


		this.reset();

		lychee.Events.call(this, 'logic');

	};


	Class.prototype = {

		reset: function() {

			this.path.reset();
			this.__level = null;
			this.__selected = null;

		},

		createLevel: function(type, id) {

			if (game[type][id] instanceof Function) {

				this.__level = new game[type][id](this.game, this, this.game.loop);

				this.path.reset();
				this.path.generate(this.__level.getCluster(), {
					x1: 0,
					y1: 0,
					x2: this.__level.width,
					y2: this.__level.height
				});

			} else {
				this.__level = null;
			}


			return this.__level;

		},

		spawnEntities: function(team, type, amount, created) {

			created = typeof created === 'number' ? created : 0;

			if (amount === created) return;


			var createdEntity = null;
			if (game[team][type] instanceof Function) {

				var color = this.game.settings.palette[team] || '#fff';

				if (this.__level !== null) {

					var spawnPoint = this.__level.getSpawnPoint(team);
					if (spawnPoint !== null) {

						var position = this.path.getNearest(spawnPoint);

						var entity = new game[team][type]({
							position: {
								x: position.x,
								y: position.y
							},
							color: color
						});


						createdEntity = this.__level.addEntity(entity);

					}

				}

				created++;

				if (team === this.game.settings.team) {
					this.game.jukebox.play('unit-ready');
				} else {

					if (team === 'neutral' && this.game.settings.team === 'immune') {
						this.game.jukebox.play('reinforcements-have-arrived');
					} else {
						this.game.jukebox.play('enemy-approaching');
					}

				}


				// FIXME: HACK
				if (amount === 1) {
					return createdEntity;
				}

				this.loop.timeout(created * this.game.settings.spawntimeout, function() {
					this.spawnEntities(team, type, amount, created);
				}, this);

			}

		},

		getUnits: function(team) {

			var filtered = {};

			if (this.__level !== null) {

				var entities = this.__level.getEntities();
				for (var e in entities) {

					if (entities[e] === null) continue;

					if (
						entities[e].isTeam(team) === true
						&& entities[e].type === 'unit'
					) {
						filtered[e] = entities[e];
					}

				}

			}


			return filtered;

		},

		getCells: function(team) {

			team = typeof team === 'string' ? team : null;

			var filtered = {};

			if (this.__level !== null) {

				var entities = this.__level.getEntities();
				for (var e in entities) {

					if (entities[e] === null) continue;

					if (
						(team === null || entities[e].isTeam(team) === true)
						&& entities[e].type === 'cell'
					) {
						filtered[e] = entities[e];
					}

				}

			}


			return filtered;

		},

		getEntityByPosition: function(position, range) {

			range = typeof range === 'number' ? range : 5;


			if (this.__level !== null) {

				var entities = this.__level.getEntities();

				for (var e in entities) {

					var entity = entities[e];
					if (entity === null) continue;


					var radius = entity.radius || 0;
					var pos = entity.getPosition();

					var deltaX = pos.x - position.x;
					var deltaY = pos.y - position.y;


					var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
					if (distance < radius + range) {
						return entity;
					}

				}

			}


			return null;

		},

		__onCollision: function(unit, enemy) {


			// 1. FRIEND CONTACT
			if (unit.team === enemy.team) {

				if (
					enemy.model === 'BLymphocyte'
					&& unit.model === 'IgM'
				) {

					var success = enemy.activate(unit.model);
					if (success === true) {
						unit.health = 0;
						return;
					}

				}


			// 2. ENEMY CONTACT
			} else {

				unit.attack(enemy, function() {
					var position = this.path.getNearest(unit.position);
					unit.move(position);
				}, this);

				return;

			}


			// 3. NOTHING TO DO
			var position = this.path.getNearest(unit.position);
			unit.move(position);

		},

		attackEnemy: function(unit, enemy) {

			var target = null;

			if (enemy.type === 'cell') {


				// 1. SHIELDING VESICLES

				target = enemy.getVesicle('neutral', unit.position);

				if (unit.team === 'immune') {

					if (target === null) {
						target = enemy.getVesicle('virus', unit.position);
					}


				} else if (unit.team === 'virus') {

					if (target === null) {
						target = enemy.getVesicle('immune', unit.position);
					}

				} else if (unit.team === 'neutral') {
					target = enemy.getVesicle('virus', unit.position);
				}

			}

			// 2. ENEMY
			if (
				target === null
				&& enemy.health > 0
			) {
				target = enemy;
			}


			if (target === null) return;


			var path = this.path.find(unit.position, target.position);
			if (path !== null) {

				this.moveUnitAlongPath(unit, path, 0, function() {

					var duration = unit.move(target.position);

					this.loop.timeout(duration, function() {
						this.__onCollision(unit, target);
					}, this);

				}, this);

			} else {

				var duration = unit.move(target.position);

				this.loop.timeout(duration, function() {
					this.__onCollision(unit, target);
				}, this);

			}

		},

		moveUnitAlongPath: function(unit, path, index, callback, scope) {

			index = typeof index === 'number' ? index : 0;

			if (path[index] === undefined) {
				callback && callback.call(scope);
				return;
			}


			var duration = unit.move(path[index]);

			this.loop.timeout(duration, function() {
				this.moveUnitAlongPath(unit, path, ++index, callback, scope);
			}, this);

		},

		select: function(entity) {
			this.__selected = entity;
			this.trigger('select', [ this.__selected ]);
		},

		deselect: function(entity) {

			if (this.__selected === entity) {
				this.__selected = null;
				this.trigger('select', [ this.__selected ]);
			}

		},

		getSelected: function() {
			return this.__selected;
		},

		isSelected: function(entity) {
			return this.__selected === entity;
		},

		touch: function(position) {

			var entity = this.getEntityByPosition(position);


			if (this.__level !== null) {
				this.__level.touch(position, entity);
			}


			// 1. SELECT / DESELECT
			if (
				this.__selected === null
				&& entity !== null
				&& entity.isTeam(this.game.settings.team) === true
			) {


				if (this.isSelected(entity) === true) {

					this.deselect(entity);

				} else {

					this.select(entity);


					if (entity.getProduction instanceof Function) {

						var production = entity.getProduction();
						if (production !== null && production.ready === true) {
							this.game.jukebox.playUnitSound('ready');
						}

					} else {
						this.game.jukebox.playUnitSound('ready');
					}

				}


			// 2. UNIT COMMANDO
			} else if (this.__selected !== null && this.__selected.type === 'unit') {

				var unit = this.__selected;

				if (unit.isAttacking() === true) {
					unit.stop();
					return;
				}


				var path = this.path.find({
					x: unit.position.x,
					y: unit.position.y
				}, position);


				// 2.1 ATTACK
				if (path !== null && entity !== null) {

					this.game.jukebox.playUnitSound('attack');

					this.deselect(unit);
					this.attackEnemy(unit, entity);


				// 2.2 MOVE
				} else if (path !== null) {

					this.game.jukebox.playUnitSound('move');

					this.deselect(unit);
					this.moveUnitAlongPath(unit, path);

				}


			// 3. CELL COMMANDO
			} else if (this.__selected !== null && this.__selected.type === 'cell') {

				var cell = this.__selected;
				var team = this.game.settings.team;

				var production = null;
				if (cell.getProduction !== undefined) {
					production = cell.getProduction();
				}

				// 3.1 CELL PRODUCTION SPAWN
				if (production !== null && production.ready === true) {

					var model = production.model;
					var unit = this.spawnEntities(team, model, 1);

					if (unit !== null) {

						cell.startProduction();

						var path = this.path.find({
							x: unit.position.x,
							y: unit.position.y
						}, position);


						if (path !== null) {

							this.moveUnitAlongPath(unit, path, 0, function() {

							}, this);


						} else {

							var duration = unit.move(unit, position);
							this.loop.timeout(duration, function() {

							}, this);

						}


					}

				}


				this.deselect(cell);

			}

		}

	};


	return Class;

});

