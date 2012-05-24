// Why? Asynchronous loading, Builder can be faster -.-
if (Object.prototype.toString.call(this.lychee) !== '[object Object]') {
	this.lychee = {};
}


(function(lychee, global) {

	var _tree = {};
	var _base = {
		// default paths
		'lychee': './lychee'
	};


	lychee.define = function(name) {

		var namespace = null,
			classname = null;

		if (name.match(/\./)) {
			var tmp = name.split('.');
			classname = tmp[tmp.length - 1];
			tmp.pop();
			namespace = tmp.join('.');
		} else {
			classname = name;
			namespace = 'lychee';
		}

		_tree[namespace + '.' + classname] = new lychee.Class(namespace, classname);

		return _tree[namespace + '.' + classname];

	};


	lychee.extend = function(obj) {

		for (var a = 1, al = arguments.length; a < al; a++) {

			var obj2 = arguments[a];
			if (obj2) {

				for (var prop in obj2) {
					obj[prop] = obj2[prop];
				}

			}

		}


		return obj;

	};


	lychee.rebase = function(settings) {

		if (Object.prototype.toString.call(settings) !== '[object Object]') {
			throw 'Use rebase(hashmap)';
			return lychee;
		}

		for (var space in settings) {
			_base[space] = settings[space];
		}

	};


	var _setupNamespace = function(namespace, scope, offset) {

		offset = offset || 0;

		var ns = namespace.split('.');


	};

	var _getNamespace = function(index, pointer) {

		for (var i = 0; i < index.length; i++) {
			pointer = pointer[index[i]];
		}

		return pointer;

	};

	var _exportClass = function(lyClass, scope) {

		_setupNamespace(lyClass._space, scope);

		var pointer = scope;
		var exportNS = _getNamespace(lyClass._space.split('.'), pointer);

		if (lyClass._exports !== null) {
			exportNS[lyClass._name] = lyClass._exports.call(lychee, lychee);
		}

	};


	lychee.build = function(start, tags, callback, scope) {

		var builder = new lychee.Builder(_tree, _base, tags);
		builder.build(start, callback, scope);

	};


	lychee.Class = function(space, name) {

		// allows new lychee.Class('Renderer') without a namespace
		space = typeof name === 'string' ? space : null;
		name = typeof name === 'string' ? name : space;

		this._space = space;
		this._name = name;
		this._tags = {};
		this._requires = {};
		this._includes = {};
		// FIXME: This needs to be done a different way
		// dunno how... atm
		this._includesArr = [];
		this._exports = null;

		return this;

	};


	lychee.Class.prototype = {

		tags: function(tags) {

			if (Object.prototype.toString.call(tags) !== '[object Object]') {
				throw 'Use tags(hashmap)';
				return this;
			}

			for (var name in tags) {
				var value = tags[name];
				this._tags[name] = value;
			}

			return this;

		},

		requires: function(requires) {

			if (Object.prototype.toString.call(requires) !== '[object Array]') {
				throw 'Use requires(array)';
				return this;
			}

			for (var r = 0, l = requires.length; r < l; r++) {

				var id;

				if (requires[r].match(/\./)) {
					id = requires[r];
				} else if (this._space !== null) {
					id = this._space + '.' + requires[r];
				} else {
					id = requires[r];
				}


				this._requires[id] = r;

			}

			return this;

		},

		includes: function(includes) {

			if (Object.prototype.toString.call(includes) !== '[object Array]') {
				throw 'Use includes(array)';
				return this;
			}

			for (var i = 0, l = includes.length; i < l; i++) {

				var id;
				// TODO: This needs to be more generic
				// but dunno how atm

				if (includes[i].match(/\./)) {
					id = includes[i];
				} else if (this._space !== null) {
					id = this._space + '.' + includes[i];
				} else {
					id = includes[i];
				}


				// save for extending order of prototype
				this._includes[id] = i;
				this._includesArr.push(id);

			}

			return this;

		},

		exports: function(exports) {

			if (!exports instanceof Function) {
				throw 'Use exports(callback)';
				return this;
			}

			this._exports = exports;

		}

	};


})(this.lychee, this);

