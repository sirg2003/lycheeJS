
lychee.define('game.campaign.Immune1').requires([
	'game.logic.COM'
]).includes([
	'game.Level'
]).exports(function(lychee, global) {

	var _game = game;

	var Class = function(game) {

		_game.Level.call(this, game, null, null);


		this.__attackedCell = null;

		this.init();

	};


	Class.prototype = {

		init: function() {

			this.__cell = this.addEntity(new game.neutral.Cell({
				position: {
					x: this.width / 2,
					y: this.height / 2
				},
				vesicles: {
					amount: 8,
					offset: 0
				},
				radius: 100
			}));


			this.addObjective(null, 'Select a unit.', function() {
				return this.logic.getSelected() !== null;
			}, function() {

				this.logic.spawnEntities('immune', 'IgM', 1);

			}, this);

			this.addObjective(null, 'Attack a vesicle.', function() {
				return this.__attackedCell !== null;
			}, function() {
			}, this)

			this.addObjective(null, 'Capture all vesicles to get the cell.', function() {
				return this.__cell.isTeam('immune');
			}, function() {
			}, this);

			this.addObjective(null, 'Enemy is arriving...', function() {
				return this.__cell.isTeam('virus');
			}, function() {

				this.loop.timeout(3000, function() {

					this.logic.spawnEntities('virus', 'Flu', 4);

					this.addCOM('virus', 'aggressive', 'hard').start();

				}, this);

			}, this);

			this.addObjective(null, 'Use the Leucocytes support to recapture the cell.', function() {
				return this.__cell.isTeam('immune');
			}, function() {

				this.getCOM('virus').stop();

				this.loop.timeout(3000, function() {

					this.logic.spawnEntities('neutral', 'Leucocyte', 3);

					this.addCOM('neutral', 'aggressive', 'extreme').start();

				}, this);

			}, this);


			this.setSpawnPoint('immune',  this.__cell.getVesicleById(0));
			this.setSpawnPoint('neutral', this.__cell.getVesicleById(1));
			this.setSpawnPoint('virus',   this.__cell.getVesicleById(3));

		},

		touch: function(position, entity) {

			if (entity !== null) {

				if (entity instanceof game.neutral.Cell) {
					this.__attackedCell = entity;
				}

			} else {
				this.__attackedCell = null;
			}

		}

	};


	return Class;

});

