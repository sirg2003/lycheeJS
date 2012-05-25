// Why? Asynchronous loading, Builder can be faster -.-
if (Object.prototype.toString.call(this.lychee) !== '[object Object]') {
	this.lychee = {};
}


(function(lychee, global) {


	var _loading = {},
		_classes = {},
		_bases = {},
		_packages = {},
		_tree = {};

	lychee.Builder = function(tree, bases, tags) {

		_tree = tree;

		this.tags = tags || {};
		this.__buildCallback = function() {};
		this.__buildScope = global;
		this.__clock = { start: 0, end: 0 };

		var bases = bases || {};

		for (var bId in bases) {
			_bases[bId] = bases[bId];
			this.loadPackage(bId, bases[bId]);
		}

	};

	lychee.Builder.prototype = {

		build: function(start, callback, scope) {

			this.__buildStart = start;
			this.__buildClock = Date.now();

			if (callback instanceof Function) {
				this.__buildCallback = callback;
				this.__buildScope = scope || global;
			}

			this.__loop();

		},


		__walkNode: function(nodeId, list, visited) {

			visited = visited || {};

			if (visited[nodeId] !== true) {

				var node = _tree[nodeId];
				visited[nodeId] = true;

				for (var rId in node._requires) {
					if (rId.charAt(rId.length - 1) === '*') {
						this.__walkPackage(rId, list, visited);
					} else {
						this.__walkNode(rId, list, visited);
					}
				}

				for (var iId in node._includes) {
					if (iId.charAt(iId.length - 1) === '*') {
						this.__walkPackage(iId, list, visited);
					} else {
						this.__walkNode(iId, list, visited);
					}
				}

				list.push(nodeId);

			}

		},

		__walkPackage: function(packageId, list, visited) {

			visited = visited || {};

			if (visited[packageId] !== true) {

				var namespace = packageId.substr(0, packageId.length - 2);

				for (var nodeId in _tree) {

					if (
						nodeId.substr(0, namespace.length) === namespace
					) {
						this.__walkNode(nodeId, list, visited);
					}

				}

				visited[packageId] = true;

			}

		},


		__build: function() {

			var list = [];
			this.__walkNode(this.__buildStart, list);


			for (var l = 0, ll = list.length; l < ll; l++) {

				this.__exportClass(
					_tree[list[l]],
					this.__buildScope
				);

			}


			var requiredMS = Date.now() - this.__buildClock;

			if (lychee.debug === true) {
				console.log('Build finished in ' + requiredMS + 'ms:', list);
			}

			this.__buildCallback.call(this.__buildScope);

		},

		__exportClass: function(lyClass, scope) {

			var exportNS = this.__exportNamespace(lyClass._space, scope);

			var data = null;
			if (lyClass._exports !== null) {
				// exportNS[lyClass._name] = lyClass._exports.call(this.__buildScope, lychee, global);
				data = lyClass._exports.call(this.__buildScope, lychee, global);
			}


			if (
				lyClass._includesArr.length
				&& data != null
			) {

				var proto = {};
				for (var prop in data.prototype) {
					proto[prop] = data.prototype[prop];
				}


				exportNS[lyClass._name] = data;
				exportNS[lyClass._name].prototype = {};

				var extendArgs = [
					exportNS[lyClass._name].prototype
				];


				for (var i = 0; i < lyClass._includesArr.length; i++) {
					var id = lyClass._includesArr[i];
					var incLyClass = this.__getClassById(id, scope);

					if (!incLyClass || !incLyClass.prototype) {

						if (lychee.debug === true) {
							console.warn('Could not include ' + id + ', maybe you forgot to return inside the lychee.exports()?');
						}

					} else {
						extendArgs.push(this.__getClassById(id, scope).prototype);
					}

				}

				extendArgs.push(proto);

				lychee.extend.apply(lychee, extendArgs);

			} else if (data != null) {
				exportNS[lyClass._name] = data;
			}

		},

		__getClassById: function(fullname, scope) {

			var fn = fullname.split('.');
			for (var f = 0, fl = fn.length; f < fl; f++) {
				scope = scope[fn[f]];
			}

			return scope;

		},

		__exportNamespace: function(namespace, scope) {

			var pointer = scope;

			var ns = namespace.split('.');
			for (var n = 0, nl = ns.length; n < nl; n++) {

				var name = ns[n];

				if (pointer[name] === undefined) {
					pointer[name] = {};
				}

				pointer = pointer[name];

			}


			return pointer;

		},

		__findPackage: function(id, tree, base, paths) {

			var prefixes = [];
			for (var tagId in this.tags) {
				var tagVal = this.tags[tagId];
				if (typeof tagVal === 'string') {
					prefixes.push(tagId + '/' + tagVal);
				}
			}

			var tmp, t, tl, currentBase, currentTree;

			var bases = [];
			var trees = [];


			// default base is always allowed
			bases.push(base);
			trees.push(tree);


			for (var p = 0, pl = prefixes.length; p < pl; p++) {

				tmp = prefixes[p].split('/');
				currentBase = base;
				currentTree = tree;

				for (t = 0, tl = tmp.length; t < tl; t++) {
					if (Object.prototype.toString(currentTree[tmp[t]]) === '[object Object]') {
						currentBase += '/' + tmp[t];
						currentTree = currentTree[tmp[t]];
					}
				}

				if (currentBase !== base) {
					trees.push(currentTree);
					bases.push(currentBase);
				}

			}


			tmp = id.split('.');

			var validBases = [];
			var validTrees = [];
			for (var b = 0, bl = bases.length; b < bl; b++) {

				currentBase = bases[b];
				currentTree = trees[b];


				var tmp2 = currentBase.split('/');

				var offset = 0;
				for (var o = 0; o < tmp2.length; o++) {
					if (tmp2[o] === tmp[0]) {
						offset = o;
						break;
					}
				}


				// TODO: Make this more recursively :D
				for (var curId in currentTree) {

					var fullBase = currentBase + '/' + curId;
					var isValidBase = true;

					for (t = 0, tl = tmp.length; t < tl; t++) {
						if (!fullBase.match(new RegExp(tmp[t]))) {
							isValidBase = false;
						}
					}

					if (isValidBase === true && curId === tmp[tmp.length - 1]) {
						validTrees.push(currentTree[curId]);
						validBases.push(fullBase);
					}

				}

			}


			for (var v = 0, vl = validBases.length; v < vl; v++) {

				var vBase = validBases[v];
				var vTree = validTrees[v];

				for (var vId in vTree) {

					var data = vTree[vId];
					if (Object.prototype.toString.call(vTree[vId]) === '[object Array]') {
						for (var d = 0, dl = data.length; d < dl; d++) {
							paths.push(vBase + '/' + vId + '.' + data[d]);
						}
					}

				}

			}

		},

		__findClass: function(id, tree, base, paths) {

			if (
				Object.prototype.toString.call(tree) !== '[object Object]'
				|| Object.keys(tree).length === 0
			) {
				return;
			}

			for (var tId in tree) {

				if (tId === id) {

					var data = tree[tId]
					if (Object.prototype.toString.call(data) === '[object Array]') {
						for (var d = 0, l = data.length; d < l; d++) {
							paths.push( base + '/' + tId + '.' + data[d]);
						}
					}

				} else {
					this.__findClass(id, tree[tId], base + '/' + tId, paths);
				}

			}


		},

		__loop: function() {

			var isReady = true;
			var id;

			for (id in _packages) {
				if (_packages[id] === false) {
					isReady = false;
				}
			}

			for (id in _tree) {

				for (var rId in _tree[id]._requires) {

					if (
						_classes[rId] !== true
						&& _loading[rId] !== true
					) {
						this.loadClass(rId);
						isReady = false;
					}

				}

				for (var iId in _tree[id]._includes) {

					if (
						_classes[iId] !== true
						&& _loading[iId] !== true
					) {
						this.loadClass(iId);
						isReady = false;
					}

				}

			}

			for (id in _loading) {
				if (_loading[id] === true) {
					isReady = false;
				}
			}

			if (isReady === true) {
				this.__build();
			} else {
				var that = this;
				setTimeout(function() {
					that.__loop();
				}, 100);
			}

		},

		loadClass: function(id) {

			var path = '';
			if (id.match(/\./)) {

				var tmp = id.split('.');
				var urls, tmp2;

				if (
					Object.prototype.toString.call(_packages[tmp[0]]) === '[object Object]'
				) {

					// TODO: Tag integration

					urls = [];

					var lastIndex = tmp[tmp.length - 1];
					if (lastIndex === '*') {

						tmp2 = tmp;
						tmp2.pop();
						tmp2 = tmp2.join('.');

						this.__findPackage(tmp2, _packages[tmp[0]], _bases[tmp[0]], urls);

					} else {

						this.__findClass(tmp[tmp.length - 1], _packages[tmp[0]], _bases[tmp[0]], urls);

					}


					if (urls.length === 0) {
						throw new Error('Package Index is corrupt, could not find ' + id);
					}

				} else if (_packages[tmp[0]] === true){

					var base = _bases[tmp[0]];

					tmp.reverse();
					tmp.pop();
					tmp.reverse();


					tmp2 = base + '/' + tmp.join('/');

					urls = [ tmp2 + '.js' ];

				} else if (_packages[tmp[0]] === undefined){
					urls = [ tmp.join('/') ];
				} else if (_packages[tmp[0]] === false) {
					return false;
				}

			} else {

				urls = [ id + '.js' ];

			}


			for (var u = 0, l = urls.length; u < l; u++) {

				var url = urls[u];
				var ext = url.split('.');
				ext = ext[ext.length - 1];


				if (ext === 'js') {

					var script = document.createElement('script');
					script.async = false;

					script.onload = function() {
						_loading[id] = false;
						_classes[id] = true;
					};

					script.src = url;

					document.body.appendChild(script);

				} else if (ext === 'css') {

					var link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = url;

					document.head.appendChild(link);

					// CSS won't affect readiness of JavaScript stuff.

				}


			}

			_loading[id] = true;

		},

		loadPackage: function(id, base) {

			if (_packages[id] === undefined) {

				_packages[id] = false;

				var url = base + '/package.json';

				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, false);
				xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');

				var that = this;
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {

						var data;
						try {
							data = JSON.parse(xhr.responseText);
							_packages[id] = data;
						} catch(e) {

							if (lychee.debug === true) {
								console.warn('Exception: ' + e.message);
								console.warn('No Package Data found for "' + id + '" at base "' + base + '", so tagging is disabled for this package.');
							}

							_packages[id] = true;

						}

					}
				};

				xhr.send(null);

			}

		}

	};

})(this.lychee, this);

