
lychee.define('game.Statusbar').exports(function(lychee, global) {

	var Class = function(game) {

		this.game = game;

		this.__renderer = this.game.renderer;

		this.reset(this.game.layers.statusbar);

	};


	Class.prototype = {

		reset: function(layer) {

			this.__layer = layer;

			this.__entities = {};
			this.__entities.objective = {};
			this.__entities.selection = {};

			this.__objective = null;
			this.__selection = null;


			this.__entities.objective.description = new game.entity.Text(
				'Objective: Have Fun',
				this.game.fonts.small, {
					position: {
						x: 20,
						y: 8
					}
				}
			);


			this.__entities.selection.unit = new game.entity.Text(
				'',
				this.game.fonts.small, {
					position: {
						x: 20,
						y: 50
					}
				}
			);

			this.__entities.selection.description = new game.entity.Text(
				'',
				this.game.fonts.small, {
					position: {
						x: 20,
						y: 70
					}
				}
			);

		},


		update: function(clock, delta) {
		},

		render: function(clock, delta) {

			var layer = this.__layer;


			this.__renderer.drawBox(
				layer.offset.x,
				layer.offset.y,
				layer.offset.x + layer.width,
				layer.offset.y + layer.height,
				'#333',
				true
			);


			if (this.__objective !== null) {
				this.__renderer.renderLayer(this.getObjectiveEntities(), layer);
			}

			this.__renderer.drawBox(
				layer.offset.x,
				layer.offset.y + 30,
				layer.offset.x + layer.width,
				layer.offset.y + 32,
				'#fff',
				true
			);

			if (this.__selection !== null) {
				this.__renderer.renderLayer(this.getSelectionEntities(), layer);
			}

/*
 *			var margin = 20;
			var previewAB = (layer.height - 2 * margin) | 0;

			this.__renderer.drawBox(
				layer.offset.x + margin,
				layer.offset.y + margin,
				layer.offset.x + margin + previewAB,
				layer.offset.y + margin + previewAB,
				'#fff',
				false,
				3
			);
*/

		},

		getObjectiveEntities: function() {
			return this.__entities.objective;
		},

		getSelectionEntities: function() {
			return this.__entities.selection;
		},

		setObjective: function(objective) {

			this.__objective = objective;

			if (this.__objective !== null) {
				this.__entities.objective.description.setText('Objective: ' + objective.description);
			} else {
				this.__entities.objective.description.setText('Objective: Have Fun.');
			}

		},

		setSelection: function(entity) {

			this.__selection = entity;


			if (this.__selection !== null) {
				this.__entities.selection.unit.setText(entity.type.charAt(0).toUpperCase() + entity.type.substr(1) + ' : ' + entity.model);
				this.__entities.selection.description.setText(this.__getDescription(entity));
			}

		},



		// FIXME: This needs to be done somehow via generic TechTree
		__getDescription: function(entity) {

			var description = null;
			switch (entity.model) {

				case 'BLymphocyte':

					if (entity.type === 'unit') {
						description = 'Active with an Immunglobuline.';
					} else if (entity.type === 'cell') {
						description = 'Increases Immuneglobuline production.';
					}

				break;

				case 'IgM':
					description = 'IgMs are the weakest Immunglobuline. Effective as first-counterattack units.';
				break;


			}


			return description === null ? '' : description;

		}

	};


	return Class;

});

