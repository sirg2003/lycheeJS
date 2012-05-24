
lychee.define('Events').exports(function(lychee, global) {

	var _id = 0;

	var Class = function(namespace) {

		this.___namespace = namespace;

		this.___parents = [];
		this.___children = [];

		this.___events = {};
		this.___eventsLength = 0;

		this.___id = ++_id;
		this.___callerId = 0;

	};

	Class.prototype = {

		subscribe: function(object, as) {

			if (!object instanceof Class) {
				return false;
			}


			as = as === 'child' ? 'child' : 'parent';

			if (as === 'child') {
				this.___children.push(object);
				return true;
			} else if (as === 'parent') {
				this.___parents.push(object);
				return true;
			}


			return false;

		},

		unsubscribe: function(object, as) {

			if (!object instanceof Class) {
				return false;
			}

			as = as === 'child' ? 'child' : 'parent';

			var list = as === 'child' ? this.__children : this.__parents,
				found = false;

			for (var i = 0, l = list.length; i < l; i++) {

				var entry = list[i];
				if (entry === object) {
					found = true;
					list.splice(i, 1);
					l--;
				}

			}


			return found === true ? true : false;

		},

		bind: function(type, callback, scope, once) {


			var passSelf = false;
			if (type.substr(0, 1) === '#') {
				type = type.substr(1, type.length - 1);
				passSelf = true;
			}

			if (this.___events[type] === undefined) {
				this.___events[type] = [];
			}

			var parents = type.match(/\./g);

			this.___events[type].push({
				parents: parents !== null ? parents.length: 0,
				callback: callback,
				scope: scope || global,
				passSelf: passSelf,
				once: once || false,
				at: this.___callerId
			});

		},

		unbind: function(type, callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope = scope !== undefined ? scope : null;

			if (this.___events[type] === undefined) {
				return true;
			}

			var found = false;

			for (var i = 0, l = this.___events[type].length; i < l; i++) {

				var entry = this.___events[type][i];

				if (
					(callback === null || entry.callback === callback)
					&& (scope === null || entry.scope === scope)
				) {
					found = true;
					this.___events[type].splice(i, 1);
					l--;
				}

			}

			// Why this? GC somehow doesn't clean up this scope if local vars are used
			return found === true ? true : false;

		},

		trigger: function(type, data, direction) {

			direction = direction !== undefined ? direction : true;

			if (data === undefined) {
				data = [];
			}

			if (data.___origin === undefined) {
				data.___origin = this.___id;
			}

			if (data.___handled === undefined) {
				data.___handled = {};
			}

			if (data.___handled[this.___id] === true) {
				return null;
			}

			if (
				direction === true
				&& this.___triggerChildren(type, data, direction) === true
			) {
				return true;
			}

			if (this.___trigger(type, data) === true) {
				return true;
			}

			if (
				direction !== false && direction !== null
				&& this.___triggerParents(type, data, direction) === true
			) {
				return true;
			}


			return false;

		},

		___trigger: function(type, data) {

			var blocked = false;

			if (data !== undefined) {
				data.___handled[this.___id] = true;
			}

			this.___callerId++;

			if (this.___events[type] !== undefined) {

				var passData = data;

				for (var i = 0, l = this.___events[type].length; i < l; i++) {

					var entry = this.___events[type][i];
					if (entry.at >= this.___callerId) continue;


					if (entry.passSelf === true) {
						passData = [ this ];
						passData.push.apply(passData, data);
					}


					if (entry.callback.apply(entry.scope, passData) === true) {
						blocked = true;
					}

					if (entry.once === true) {
						this.unbind(type, entry.callback, entry.scope);
					}

				}

			}


			return blocked === true ? true : false;

		},

		___triggerChildren: function(type, data, direction) {

			var blocked = false;

			for (var i = 0, l = this.___children.length; i < l; i++) {

				var child = this.___children[i];

				if (child.trigger(type, data, direction) === true) {
					blocked = true;
				}

			}


			return blocked === true ? true :false;

		},

		___triggerParents: function(type, data, direction) {

			var blocked = false;

			if (this.___parents.length > 0) {

				var newData = [ this ];
				newData.push.apply(newData, data);
				newData.___origin = data ? data.___origin : null;
				newData.___handled = data ? data.___handled : null;


				for (var i = 0, l = this.___parents.length; i < l; i++) {

					var parent = this.___parents[i];
					if (parent.___id === data.___origin) continue;

					if (parent.trigger(this.___namespace + '.' + type, newData, direction) === true) {
						blocked = true;
					}

				}

			}


			return blocked === true ? true : false;

		}

	};


	return Class;

});

