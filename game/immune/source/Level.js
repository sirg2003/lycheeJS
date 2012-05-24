
lychee.define('game.Level').requires([
	'game.logic.COM'
]).includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var _game = game;

	var Class = function(game, width, height) {

		this.game = game;
		this.logic = game.logic;
		this.loop = game.loop;

		this.width = width || this.game.settings.width;
		this.height = height || this.game.settings.height;

		this.__COM = {};
		this.__entities = {};
		this.__entitiesId = 0;
		this.__objectives = {};
		this.__objectivesId = 0;
		this.__cluster = {};
		this.__clusterId = 0;
		this.__spawn = {};
		this.__currentObjective = null;
		this.__nextObjectiveAvailable = true;

		this.__clock = null;

		lychee.Events.call(this, 'level');

	};


	Class.prototype = {

		__sync: function(clock) {
			this.__clock = clock;
		},

		start: function() {

			if (this.__currentObjective === null) {
				this.nextObjective();
			}

		},

		update: function(clock, delta) {

			if (this.__clock === null) {
				this.__sync(clock);
			}

			var current = this.__currentObjective;
			if (current !== null) {

				if (current.start === null) {
					current.start = this.__clock;
				}

				if (
					current.timeout !== null
					&& this.__clock > current.start + current.timeout
				) {
					this.nextObjective(false);
				} else if (current.condition.call(current.scope) === true) {
					this.nextObjective(true);
				}

			}


			for (var e in this.__entities) {

				if (this.__entities[e] === null) continue;

				if (this.__entities[e].health === 0) {
					this.__entities[e] = null;
					continue;
				}

				this.__entities[e].update(clock, delta);
			}


			for (var team in this.__COM) {
				this.__COM[team].update(clock, delta);
			}


			this.__clock = clock;

		},

		addCOM: function(team, mode, strength) {

			if (typeof team !== 'string') {
				return null;
			}


			this.__COM[team] = new game.logic.COM(
				this.logic,
				team,
				this.getSpawnPoint(team),
				mode,
				strength
			);


			return this.__COM[team];

		},

		getCOM: function(team) {
			return this.__COM[team] || null;
		},

		removeCOM: function(team) {

			if (this.__COM[team] !== undefined) {
				this.__COM[team] = null;
				return true;
			}


			return false;

		},

		addEntity: function(entity) {

			var id = this.__entitiesId++;
			this.__entities[id] = entity;

			if (entity.type === 'cell') {
				this.addNode(entity);
			}

			return this.__entities[id];

		},

		addNode: function(node) {

			var id = typeof node.id === 'string' ? node.id : ( 'node' + this.__clusterId++);
			this.__cluster[id] = node;

			return this.__cluster[id];

		},

		getCluster: function() {
			return this.__cluster;
		},

		getEntity: function(id) {
			return this.__entities[id] || null;
		},

		getEntities: function() {
			return this.__entities;
		},

		removeEntity: function(entity) {

			for (var e in this.__entities) {

				if (this.__entities[e] === null) continue;

				if (this.__entities[e] === entity) {
					this.__entities[e] = null;
				}

			}

		},

		addObjective: function(timeout, description, condition, callback, scope) {

			timeout = typeof timeout === 'number' ? timeout : null;
			description = typeof description === 'string' ? description : 'Have Fun';
			condition = condition instanceof Function ? condition : function(){};
			callback = callback instanceof Function ? callback : function(){};
			scope = scope !== undefined ? scope : this;


			var objective = {
				id: this.__objectivesId++,
				timeout: timeout,
				start: null, // is set on nextObjective() call
				end: null,
				description: description,
				condition: condition,
				callback: callback,
				completed: false,
				scope: scope
			};

			this.__objectives[objective.id] = objective;

			return this.__objectives[objective.id];

		},

		nextObjective: function(completed) {

			completed = completed === true ? true : false;

			var id = 0;
			if (this.__currentObjective !== null) {
				id = this.__currentObjective.id + 1;
			}


			if (this.__currentObjective !== null) {
				this.__currentObjective.completed = true;
				this.__currentObjective.end = this.__clock;
			}


			if (this.__objectives[id]) {

				this.__currentObjective = this.__objectives[id];
				this.__currentObjective.start = this.__clock;
				this.__currentObjective.callback.call(this.__currentObjective.scope);

				this.trigger('objective', [ this.__objectives[id] ]);

			} else {
				this.__nextObjectiveAvailable = false;
				this.trigger('objective', [ null ]);
			}

		},

		areAllCellsCaptured: function() {

			var all = 0;
			var virus = 0;
			var immune = 0;


			var cells = this.logic.getCells();
			for (var c in cells) {

				if (cells[c].isTeam('virus') === true) {
					virus++;
				} else if (cells[c].isTeam('immune') === true) {
					immune++;
				}

				all++;

			}


			if (immune === all || virus === all) {
				return true;
			}


			return false;

		},

		getObjective: function() {
			return this.__currentObjective || null;
		},

		getStatistics: function() {

			var statistics = {};

			for (var id in this.__objectives) {

				var objective = this.__objectives[id];
				statistics[id] = {
					id: objective.id,
					description: objective.description,
					completed: objective.completed,
					start: objective.start,
					end: objective.end
				};

			}


			return statistics;

		},

		getSpawnPoint: function(team) {
			return this.__spawn[team] || null;
		},

		setSpawnPoint: function(team, entityOrPosition) {

			var position = entityOrPosition;
			if (entityOrPosition && entityOrPosition.getPosition instanceof Function) {
				position = entityOrPosition.getPosition();
			}

			this.__spawn[team] = position;
			return true;

		},

		isComplete: function() {

			if (this.__nextObjectiveAvailable === false) {
				return true;
			}


			return false;

		}

	};


	return Class;

});

