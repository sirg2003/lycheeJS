
lychee.define('game.Board').requires([
	'game.entity.Jewel'
]).exports(function(lychee, global) {

	var Class = function(game, settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		this.game = game;
		this.loop = game.loop;

		this.__locked = false;

	};


	Class.prototype = {

		defaults: {
			width:  10,
			height: 6,
			tween:  300,
			tile:   64
		},

		resize: function(settings) {
			this.settings = lychee.extend({}, this.settings, settings);
		},

		reset: function() {

			var sizeX = this.settings.width,
				sizeY = this.settings.height,
				tile = this.settings.tile;

			this.__grid = {};


			for (var x = 0; x < sizeX; x++) {
				for (var y = 0; y < sizeY; y++) {

					(function(that, x, y, tile) {

						var jewel = new game.entity.Jewel({
							position: {
								x: x * tile + tile / 2,
								y: -1 * tile
							}
						});

						jewel.setTween(y * that.settings.tween, {
							y: y * tile + tile / 2
						}, lychee.game.Entity.TWEEN.bounceEaseOut);

						that.__grid[x + '_' + y] = jewel;

					})(this, x, y, tile);

				}
			}

			this.__refreshHint();

		},

		get: function(x, y) {
			return this.__grid[x + '_' + y] || null;
		},

		set: function(x, y, jewel) {
			jewel = jewel instanceof game.entity.Jewel ? jewel : null;
			this.__grid[x + '_' + y] = jewel;
		},

		all: function() {
			return this.__grid;
		},

		hit: function(x, y, color, hitmap, hits) {

			var returnHits = false;
			if (hits === undefined) {
				hits = [];
				returnHits = true;
			}

			var jewel = this.get(x, y);
			if (jewel !== null && jewel.getColor() === color) {

				hits.push({
					x: x,
					y: y
				});

				hitmap[x + '_' + y] = true;

			}


			var queue = [
				{ x: x,     y: y - 1},
				{ x: x + 1, y: y},
				{ x: x,     y: y + 1},
				{ x: x - 1, y: y }
			];


			for (var q = 0, l = queue.length; q < l; q++) {

				var pos = queue[q];

				if (
					pos.x < 0
					|| pos.y < 0
					|| pos.x >= this.settings.width
					|| pos.y >= this.settings.height
				) {
					continue;
				}


				jewel = this.get(pos.x, pos.y);

				if (
					hitmap[pos.x + '_' + pos.y] !== true
					&& jewel !== null
					&& jewel.getColor() === color
				) {
					this.hit(pos.x, pos.y, color, hitmap, hits);
				}
			}


			if (returnHits === true) {
				return hits;
			}

		},

		touch: function(x, y) {

			if (this.get(x, y) === null) {
				return false;
			}

			if (this.__locked !== true) {

				var color = this.get(x, y).getColor();
				var hitmap = {};
				var hits = this.hit(x, y, color, hitmap);


				var minHits = this.game.settings.play.hits;

				if (hits.length >= minHits) {

					this.__locked = true;
					this.deactivateHint();

					if (this.game.settings.sound === true) {
						this.game.jukebox.play('success');
					}

					this.destroyHits(hits);


					var points = hits.length * 100;
					for (var h = minHits; h <= hits.length; h++) {
						points += (hits.length - h) * 200;
					}

					var time = (hits.length - minHits) * 1000;

					this.game.score.add('points', points);
					this.game.score.add('time',   time);

				} else if (this.game.settings.sound === true) {
					this.game.jukebox.play('fail');
				}

			}


			return true;

		},

		destroyHits: function(hits) {

			for (var h = 0, l = hits.length; h < l; h++) {
				var pos = hits[h];
				this.__grid[pos.x + '_' + pos.y] = null;
			}

			this.__refreshGrid();
			this.__refreshHint();

		},


 		__refreshHint: function() {

			this.__hint = null;

			var minHits = this.game.settings.play.hits;

			for (var x = 0; x < this.settings.width; x++) {
				for (var y = this.settings.height - 1; y >= 0; y--) {

					var color = this.get(x, y).getColor();
					var hitmap = {};
					var hits = this.hit(x, y, color, {});

					if (hits.length >= minHits) {
						this.__hint = hits;
						return;
					}

				}
			}


			if (this.__hint === null) {

				var startX = Math.floor(Math.random() * (this.settings.width - minHits - 1));
				var y = Math.floor(Math.random() * (this.settings.height - 1));

				var color = this.get(startX, y).getColor();

				for (var x = startX; x < startX + minHits; x++) {
					this.get(x, y).setColor(color);
				}


				this.__refreshHint();

			}

		},

		activateHint: function() {

			if (this.__hint !== null) {

				for (var h = 0, l = this.__hint.length; h < l; h++) {

					var pos = this.__hint[h];
					var jewel = this.get(pos.x, pos.y);

					jewel.setEffect(200, lychee.game.Entity.EFFECT.wobble, {
						x: 2
					}, undefined, true);

				}

			}

		},

		deactivateHint: function() {

			if (this.__hint !== null) {

				for (var h = 0, l = this.__hint.length; h < l; h++) {

					var pos = this.__hint[h];
					var jewel = this.get(pos.x, pos.y);

					jewel.setEffect(0, null);

				}

			}

		},


		__refreshGrid: function() {

			var sizeX = this.settings.width,
				sizeY = this.settings.height,
				tile = this.settings.tile;


			for (var x = 0; x < sizeX; x++) {

				var yNeedsRefresh = false;
				for (var y = sizeY - 1; y >= 0; y--) {

					if (this.__grid[x + '_' + y] === null) {

						// valid, check against null and undefined
						if (this.__grid[x + '_' + (y - 1)] !== undefined) {

							var jewel = this.get(x, y - 1);

							this.__grid[x + '_' + y] = this.__grid[x + '_' + (y - 1)];
							this.__grid[x + '_' + (y - 1)] = null;

							if (jewel !== null) {

								jewel.setTween(this.settings.tween, {
									y: y * tile + tile /2
								}, lychee.game.Entity.TWEEN.bounceEaseOut);

								yNeedsRefresh = true;

							}

						}

					}

				}

				if (yNeedsRefresh === true) {
					x--;
				}

			}


			for (var x = 0; x < sizeX; x++) {
				for (var y = 0; y < sizeY; y++) {
					if (this.__grid[x + '_' + y] === null) {
						this.__spawn(x, y);
					}
				}
			}


			this.__locked = false;

		},

		__spawn: function(x, y) {

			var tile = this.settings.tile;

			var jewel = new game.entity.Jewel({
				position: {
					x: x * tile + tile / 2,
					y: -1 * tile
				}
			});

			this.__grid[x + '_' + y] = jewel;

			jewel.setTween(y * this.settings.tween, {
				y: y * tile + tile / 2
			}, lychee.game.Entity.TWEEN.bounceEaseOut);

		}

	};


	return Class;

});

