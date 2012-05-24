
lychee.define('game.campaign.Immune2').requires([
	'game.logic.COM'
]).includes([
	'game.Level'
]).exports(function(lychee, global) {

	var _game = game;

	var Class = function(game) {

		_game.Level.call(this, game, 1200, 600);


		this.__immuneBaseLymphocyte = null;
		this.__selectedUnit = null;

		this.init();

	};


	Class.prototype = {

		init: function() {

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 900,
					y: 100
				},
				vesicles: {
					offset: -2,
					amount: 4
				},
				radius: 140
			}));


			this.addEntity(new game.neutral.Cell({
				position: {
					x: 500,
					y: 100
				},
				vesicles: {
					offset: 5,
					amount: 7
				},
				radius: 100
			}));

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 420,
					y: 500
				},
				vesicles: {
					offset: 1,
					amount: 7
				},
				radius: 100
			}));

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 850,
					y: 550
				},
				vesicles: {
					offset: 2,
					amount: 5
				}
			}));


			for (var n = 0; n < 10; n++) {

				this.addNode({
					x: 160 + Math.sin(n / 5 * Math.PI) * 120,
					y: 160 + Math.cos(n / 5 * Math.PI) * 120
				});

			}


			this.__immuneBaseSpawn = this.addNode({
				x: 160,
				y: 160
			});

			this.__immuneUnitSpawn = this.addNode({
				x: 280,
				y: 20
			});

			this.__virusSpawn = this.addNode({
				x: this.width - 20,
				y: this.height / 2
			});

			this.setSpawnPoint('virus', this.__virusSpawn);


			this.addObjective(null, 'Select the IgM Unit', function() {

				var selected = this.logic.getSelected();
				return selected !== null && selected.model === 'IgM';

			}, function() {

				this.setSpawnPoint('immune', this.__immuneBaseSpawn);
				this.__immuneBaseLymphocyte = this.logic.spawnEntities('immune', 'BLymphocyte', 1);

				this.setSpawnPoint('immune', this.__immuneUnitSpawn);
				this.logic.spawnEntities('immune', 'IgM', 1);

			}, this);

			this.addObjective(null, 'Activate the BLymphocyte using the IgM.', function() {
				return this.__immuneBaseLymphocyte !== null && this.__immuneBaseLymphocyte.type === 'cell';
			}, function() {
			}, this);

			this.addObjective(null, 'Wait until the BLymphocyte has finished production.', function() {

				var production = this.__immuneBaseLymphocyte.getProduction();
				if (production !== null && production.ready === true) {
					return true;
				}

				return false;

			}, function() {
			}, this);

			this.addObjective(null, 'Select the BLymphocyte', function() {
				return this.logic.getSelected() === this.__immuneBaseLymphocyte;
			}, function() {
			}, this);

			this.addObjective(null, 'Click anywhere on the field to spawn a new IgM.', function() {
				return this.logic.getSelected() === null;
			}, function() {
			}, this);


			this.addObjective(10000, 'Let the battle begin.', function() {
				return false; // Completion via timeout
			}, function() {

				this.logic.spawnEntities('virus', 'Flu', 2);

				this.loop.timeout(30000, function() {
					this.logic.spawnEntities('virus', 'Flu', 2);
				}, this);

				this.addCOM('virus', 'aggressive', 'normal').start();

			}, this);


			this.addObjective(null, 'Capture all cells.', function() {
				return this.areAllCellsCaptured() === true;
			}, function() {
			}, this);

		},

		touch: function(position, entity) {

		}

	};


	return Class;

});

