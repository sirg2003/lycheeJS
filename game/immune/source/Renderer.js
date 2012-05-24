
lychee.define('game.Renderer').requires([
	'game.entity.Text',
	'game.neutral.Cell',
	'game.neutral.Leucocyte',
	'game.immune.IgM',
	'game.immune.BLymphocyte',
	'game.virus.Flu'
]).includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.Renderer.call(this);

		this.game = game;
		this.settings = lychee.extend({}, this.defaults);

		this.__infoBoxClock = null;

	};

	Class.prototype = {

		sync: function(clock, delta) {
			this.__clock = clock;
			this.__delta = delta;
		},

		setAlpha: function(alpha) {
			alpha = typeof alpha === 'number' ? alpha : 1;
			this.__ctx.globalAlpha = alpha;
		},

		renderLayer: function(entities, layer) {

			if (this.__state !== 'running') return;

			layer = Object.prototype.toString.call(layer) === '[object Object]' ? layer : null;

			var offsetX = 0;
			var offsetY = 0;
			var width = this.__width;
			var height = this.__height;


			if (layer !== null) {

				offsetX = layer.offset.x;
				offsetY = layer.offset.y;

				width = layer.width;
				height = layer.height;

			}


			for (var e in entities) {

				if (entities[e] === null) continue;

				var entity = entities[e];
				var pos = entity.getPosition();
				var radius = entity.radius || 0;


				var x = offsetX;
				if (pos.x === 'center') {
					x = 'center';
				} else {

					x += pos.x;
					x = x | 0;

					if (entity.type !== 'text' && (x < -1 * radius || x > width + radius)) {
						continue;
					}

				}

				var y = offsetY;
				if (pos.y === 'center') {
					y = 'center';
				} else {

					y += pos.y;
					y = y | 0;

					if (entity.type !== 'text' && (y < -1 * radius || y > height + radius)) {
						continue;
					}

				}


				if (entity.type === 'text') {

					this.renderText(x, y, entity);

				} else if (entity.type === 'unit') {

					this.renderUnit(x, y, entity);

				} else if (entity.type === 'cell') {

					this.renderCell(x, y, entity);


					var vesicles = entity.getVesicles();
					for (var v in vesicles) {

						var vPos = vesicles[v].getPosition();
						var vx = offsetX + vPos.x;
						var vy = offsetY + vPos.y;

						this.renderVesicle(vx, vy, vesicles[v]);

					}


					var health = entity.health || 0;

					for (var v in vesicles) {
						health += vesicles[v].health;
					}

					health = health | 0;


					var text = entity.team + ' ( ' + health + ' )';
					this.drawText(
						text,
						x - (text.length * 5),
						y - 10,
						this.game.fonts.small
					);


					if (entity.getProduction !== undefined) {

						var production = entity.getProduction();
						if (production !== null) {

							if (production.ready === true) {

								this.drawText(
									'ready',
									x - 25,
									y - 40,
									this.game.fonts.small
								);

							} else {

								var seconds = Math.round(((production.start + production.duration) - this.__clock) / 1000) | 0;

								this.drawText(
									seconds + '',
									x,
									y - 40,
									this.game.fonts.small
								);

							}

						}

					}

				}


				if (
					lychee.debug === true
					&& layer !== null
					&& layer.type === 'dynamic'
				) {

					this.drawText(
						e,
						x + 20,
						y - 20,
						null,
						'#f00'
					);

				}

			}

		},

		renderText: function(x, y, entity) {
			this.drawText(entity.text, x, y, entity.font, null);
		},

		renderUnit: function(x, y, entity) {

			var color = this.game.settings.palette[entity.team] || '#fff';
			var radius = entity.radius;


			this.__ctx.fillStyle = color;

			this.__ctx.beginPath();
			this.__ctx.arc(
				x,
				y,
				radius,
				0,
				Math.PI * 2
			);

			this.__ctx.fill();
			this.__ctx.closePath();


			if (entity.info !== null) {

				var l = entity.info.length;

				this.drawText(
					entity.info,
					x - l * 4,
					y - 6,
					this.game.fonts.small
				);

			}

		},

		renderCell: function(x, y, entity) {

			var color = this.game.settings.palette[entity.team] || '#fff';
			var radius = entity.radius;


			this.__ctx.strokeStyle = color;

			this.__ctx.beginPath();
			this.__ctx.lineWidth = radius / 10;

			this.__ctx.arc(
				x,
				y,
				radius,
				0,
				Math.PI * 2
			);

			this.__ctx.stroke();
			this.__ctx.closePath();

		},

		renderVesicle: function(x, y, entity) {

			var color = this.game.settings.palette[entity.team] || '#fff';
			var radius = entity.cell.radius / 10;


			this.__ctx.fillStyle = color;

			this.__ctx.beginPath();

			this.__ctx.arc(
				x,
				y,
				radius,
				0,
				Math.PI * 2
			);

			this.__ctx.fill();
			this.__ctx.closePath();

		},

		renderPathCluster: function(path, layer) {

			if (this.__state !== 'running') return;

			layer = Object.prototype.toString.call(layer) === '[object Object]' ? layer : null;

			var offsetX = 0;
			var offsetY = 0;
			var width = this.__width;
			var height = this.__height;


			if (layer !== null) {

				offsetX = layer.offset.x;
				offsetY = layer.offset.y;
				width = layer.width;
				height = layer.height;

			}


			var cluster = path.getCluster();

			for (var c in cluster) {

				var node = cluster[c];

				this.drawCircle(
					(offsetX + node.x) | 0,
					(offsetY + node.y) | 0,
					9,
					'#f00',
					false
				);

				for (var l = 0, ll = node.links.length; l < ll; l++) {

					var oNode = path.getNode(node.links[l]);
					if (oNode !== null) {

						this.drawLine(
							(offsetX + node.x) | 0,
							(offsetY + node.y) | 0,
							(offsetX + oNode.x) | 0,
							(offsetY + oNode.y) | 0,
							'#ff0',
							2
						);

					}

				}

			}

		},

		renderSelected: function(entity, layer) {

			if (this.__state !== 'running') return;

			if (this.__infoBoxClock === null) {
				this.__infoBoxClock = this.__clock;
			}


			layer = Object.prototype.toString.call(layer) === '[object Object]' ? layer : null;

			var offsetX = 0;
			var offsetY = 0;
			var width = this.__width;
			var height = this.__height;


			if (layer !== null) {

				offsetX = layer.offset.x;
				offsetY = layer.offset.y;

				width = layer.width;
				height = layer.height;

			}



			var pos = entity.getPosition();
			var color = this.game.settings.palette[entity.team] || '#fff';
			var t = 1 - ((this.__clock - this.__infoBoxClock) % 800) / 800;


			var x = offsetX + pos.x;
			x = x | 0;

			var y = offsetY + pos.y;
			y = y | 0;


			var bb = (entity.radius || 0) + t * 10;


			this.drawBox(
				x - bb,
				y - bb,
				x + bb,
				y + bb,
				color,
				false,
				2
			);

		}

	};


	return Class;

});

