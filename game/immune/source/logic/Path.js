
lychee.define('game.logic.Path').exports(function(lychee, global) {

	var Class = function(game, settings) {

		this.game = game;

		this.settings = lychee.extend({}, this.defaults, settings);

		this.reset();

	};


	Class.prototype = {

		defaults: {
			celldepth: 16,
			range: 90,
			timeout: 100
		},

		reset: function() {

			this.__tree = {};
			this.__nodeId = 0;
			this.__cache = {};

		},

		generate: function(cluster, box) {


			if (Object.prototype.toString.call(box) !== '[object Object]') {
				box = {};
			}

			box.x1 = typeof box.x1 === 'number' ? box.x1 : 0;
			box.y1 = typeof box.y1 === 'number' ? box.y1 : 0;
			box.x2 = typeof box.x2 === 'number' ? box.x2 : this.game.settings.width;
			box.y2 = typeof box.y2 === 'number' ? box.y2 : this.game.settings.height;


			/*
			 * 1. FILTER NODES BY TYPE
			 */
			var todo = {};

			for (var c in cluster) {

				var node = cluster[c];
				var type = node.type === 'cell' ? 'cell' : 'node';

				if (type === 'cell') {

					todo[c] = {
						id: c,
						type: type,
						x: node.position.x,
						y: node.position.y,
						radius: node.radius || 0
					};

				} else {

					todo[c] = {
						type: type,
						x: node.x,
						y: node.y
					};

				}

			}


			/*
			 * 2. GENERATE NODES
			 */
			var tree = {};

			for (var t in todo) {

				var entry = todo[t];

				if (entry.type === 'cell') {

					var distance = Math.max(this.settings.range, entry.radius + 20);
					var celldepth = Math.max(this.settings.celldepth, Math.round(entry.radius / this.settings.range * 8));

					for (var n = 0; n < celldepth; n++) {

						var node = {
							id: entry.id + '-' + n,
							x: entry.x + Math.sin(n / celldepth * Math.PI * 2) * distance,
							y: entry.y + Math.cos(n / celldepth * Math.PI * 2) * distance
						};

						node.x = node.x | 0;
						node.y = node.y | 0;


						if (n === 0) {
							node.links = [
								entry.id + '-' + (n + 1),
								entry.id + '-' + (celldepth - 1)
							];
						} else if (n === celldepth - 1) {
							node.links = [
								entry.id + '-0',
								entry.id + '-' + (n - 1)
							];
						} else {
							node.links = [
								entry.id + '-' + (n - 1),
								entry.id + '-' + (n + 1)
							];
						}


						this.addNode(node, this.settings.range);

					}

				} else if (entry.type === 'node') {

					this.addNode(entry, this.settings.range);

				}

			}


			/*
			 * 3. SHRINK
			 */
			this.shrinkCluster(box.x1, box.y1, box.x2, box.y2);


			/*
			 * 4.1 FIX MISSING LINKS (CELLS)
			 */
			var alreadyFixed = {};
			for (var t1 in todo) {

				var from = todo[t1];

				for (var t2 in todo) {

					var to = todo[t2];

					if (from.type !== 'cell' || to.type !== 'cell') continue;

					if (
						from === to
						|| alreadyFixed[from.id + '-' + to.id] === true
						|| alreadyFixed[to.id + '-' + from.id] === true
					) continue;


					var path = this.find(from, to);
					if (path !== null) {

						var last = path[path.length - 1];
						var prefix = to.id + '';
						if (last.id.substr(0, prefix.length) !== prefix) {

							var nearest = this.getNearestByPrefix(last, prefix);
							if (nearest !== null) {
								last.links.push(nearest.id);
								nearest.links.push(last.id);
								alreadyFixed[from.id + '-' + to.id] = true;
							}

						}

					}

				}

			}


			/*
			 * 4.2 FIX MISSING LINKS (NODES)
			 */
			for (var t1 in todo) {

				var from = todo[t1];

				for (var t2 in todo) {

					var to = todo[t2];

					if (to.type !== 'node') continue;
					if (alreadyFixed['-' + to.id] === true) continue;

					var path = this.find(from, to);
					if (path !== null) {

						var last = path[path.length - 1];
						if (last !== to) {
							last.links.push(to.id);
							to.links.push(last.id);
							alreadyFixed['-' + to.id] = true;
						}

					}

				}

			}

		},

		getCluster: function() {
			return this.__tree;
		},

		shrinkCluster: function(x1, y1, x2, y2) {

			for (var t in this.__tree) {

				var node = this.__tree[t];
				if (
					node.x < x1 || node.x > x2
					|| node.y < y1 || node.y > y2
				) {
					delete this.__tree[t];
				}

			}


			for (var t in this.__tree) {

				var node = this.__tree[t];

				if (node && node.links.length) {

					for (var l = 0, ll = node.links.length; l < ll; l++) {

						var link = this.__tree[node.links[l]];
						if (link === undefined || link === null) {
							node.links.splice(l, 1);
							l--;
							ll--;
						}

					}

				}

			}

		},

		getNode: function(id) {
			return this.__tree[id] || null;
		},

		getNodes: function(prefix) {

			var filtered = {};
			for (var t in this.__tree) {
				if (this.__tree[t].id.substr(0, prefix.length) === prefix) {
					filtered[t] = this.__tree[t];
				}
			}


			return filtered;

		},

		addNode: function(node, range) {

			range = typeof range === 'number' ? range : null;

			if (Object.prototype.toString.call(node) === '[object Object]') {

				if (typeof node.id === 'string' && this.__tree[node.id] !== undefined) {
					return false;
				}

				node.id = typeof node.id === 'string' ? node.id : 'node' + this.__nodeId++;

				node.x = node.x || 0;
				node.y = node.y || 0;

				if (node.links === undefined) {
					node.links = [];
				}


				if (range !== null) {

					for (var t in this.__tree) {

						var oNode = this.__tree[t];
						if (oNode === null) continue;

						var distance = this.__getDistance(node, oNode);
						if (distance < range && this.__inArray(oNode.id, node.links) === false) {
							node.links.push(oNode.id);
						}

					}


					if (node.links.length) {

						for (var l = 0, ll = node.links.length; l < ll; l++) {

							var oId = node.links[l];
							if (this.__tree[oId] && this.__inArray(node.id, this.__tree[oId].links) === false) {
								this.__tree[oId].links.push(node.id);
							}

						}

					}


				}


				this.__tree[node.id] = node;

				return true;

			}


			return false;

		},

		__inArray: function(id, arr) {

			for (var a = 0, l = arr.length; a < l; a++) {
				if (arr[a] === id) {
					return true;
				}
			}


			return false;

		},

		removeNode: function(id) {

			if (this.__tree[id] !== null) {

				this.__tree[id] = null;
				return true;

			}


			return false;

		},

		__getDistance: function(position, node) {
			return Math.sqrt(Math.pow(position.x - node.x, 2) + Math.pow(position.y - node.y, 2));
		},

		__compareNearest: function(position, nodeA, nodeB) {

			if (nodeA === null) return nodeB;

			if (this.__getDistance(position, nodeA) < this.__getDistance(position, nodeB)) {
				return nodeA;
			} else {
				return nodeB;
			}

		},

		getNearest: function(position, tree) {

			tree = Object.prototype.toString.call(tree) === '[object Object]' ? tree : this.__tree;

			var nearest = null;
			for (var t in tree) {
				if (tree[t] === null || tree[t] === position) continue;
				nearest = this.__compareNearest(position, nearest, tree[t]);
			}

			return nearest;

		},

		getNearestByPrefix: function(position, prefix, tree) {

			tree = Object.prototype.toString.call(tree) === '[object Object]' ? tree : this.__tree;

			var nearest = null;
			for (var t in tree) {

				if (tree[t] === null || tree[t] === position) continue;

				if (tree[t].id.substr(0, prefix.length) === prefix) {
					nearest = this.__compareNearest(position, nearest, tree[t]);
				}

			}

			return nearest;


		},

		find: function(start, goal) {

			if (
				Object.prototype.toString.call(start) !== '[object Object]'
				|| Object.prototype.toString.call(goal) !== '[object Object]'
			) {
				return null;
			}


			var startNode = this.getNearest(start);
			var goalNode = this.getNearest(goal);


			if (this.__cache[startNode.id + '-_-' + goalNode.id] !== undefined) {
				return this.__cache[startNode.id + '-_-' + goalNode.id];
			}


			var next = null;
			var timeout = Date.now() + this.settings.timeout;

			var path = [ startNode ];
			while(path[path.length - 1] !== goalNode) {

				if (Date.now() > timeout) break;

				var current = path[path.length - 1];
				var currentIndex = path.indexOf(current);


				var link = null;
				for (var l = 0, ll = current.links.length; l < ll; l++) {
					link = this.__compareNearest(goalNode, link, this.__tree[current.links[l]]);
				}

				if (link !== null) {

					var index = path.indexOf(link);
					if (index === -1) {
						path.push(link);
					}

				}

			}


			if (path.length !== 1) {
				this.__cache[startNode.id + '-_-' + goalNode.id] = path;
				return path;
			}


			return null;

		}

	};


	return Class;

});

