
lychee.define('game.skirmish.Roundabout').requires([
	'game.logic.COM'
]).includes([
	'game.Level'
]).exports(function(lychee, global) {

	var _game = game;

	var Class = function(game) {

		_game.Level.call(this, game, 1000, 600);

		this.init();

	};


	Class.prototype = {

		init: function() {

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 150,
					y: 200
				},
				radius: 100
			}));

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 390,
					y: 320
				},
				radius: 120
			}));

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 600,
					y: 100
				},
				vesicles: {
					amount: 4,
					offset: -2
				},
				radius: 80
			}));

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 600,
					y: 580
				},
				vesicles: {
					amount: 3,
					offset: 3
				},
				radius: 120
			}));

			this.addEntity(new game.neutral.Cell({
				position: {
					x: 850,
					y: 300
				},
				vesicles: {
					amount: 5,
					offset: 4
				},
				radius: 80
			}));


			this.addObjective(null, 'Capture all cells.', function() {
				return this.areAllCellsCaptured() === true;
			}, function() {

				var enemy = this.game.settings.team === 'immune' ? 'virus' : 'immune';
				this.addCOM(enemy, 'aggressive', 'normal').start();

				if (enemy === 'virus') {

					this.logic.spawnEntities('immune', 'IgM', 3);

					this.loop.timeout(5000, function() {
						this.logic.spawnEntities('virus',  'Flu', 2);
					}, this);

				} else {

					this.logic.spawnEntities('virus',  'Flu', 2);

					this.loop.timeout(5000, function() {
						this.logic.spawnEntities('immune', 'IgM', 3);
					}, this);

				}

			}, this);


			var immuneBase = this.addNode({
				x: 10,
				y: 10
			});

			var virusBase = this.addNode({
				x: this.width - 10,
				y: this.height - 10
			});

			this.setSpawnPoint('immune',  immuneBase);
			this.setSpawnPoint('virus',   virusBase);

		},

		touch: function(position, entity) {

		}

	};


	return Class;

});

