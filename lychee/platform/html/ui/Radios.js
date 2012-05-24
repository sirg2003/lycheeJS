
lychee.define('lychee.ui.Radios').tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var Class = function(values, active, callback, scope) {

		if (Object.prototype.toString.call(values) !== '[object Array]') {
			values = [ values ];
		}

		active = typeof active === 'string' ? active : values[0];
		callback = callback instanceof Function ? callback : function(){};
		scope = scope !== undefined ? scope : global;


		this.__elements = [];
		this.__values = [];
		this.__active = null;
		this.__callback = callback;
		this.__scope = scope;


		for (var v = 0, l = values.length; v < l; v++) {

			var value = values[v];
			var element = document.createElement('div');

			if (active === value) {
				this.__active = v;
				element.className = 'lychee-radio active';
			} else {
				element.className = 'lychee-radio';
			}

			this.__elements.push(element);
			this.__values.push(value);

			(function(that, element, value) {
				element.onclick = function() {
					that.set(value);
				};
			})(that, element, value);

		}

	};


	Class.prototype = {

		set: function(value) {


			var newActive = null;
			for (var e = 0, el = this.__elements.length; e < el; e++) {

				if (this.__values[e] === value) {

					if (this.__active !== null) {

						// Nothing to do
						if (this.__active === e) {
							break;
						}

						this.__elements[this.__active].className = 'lychee-radio';
						this.__elements[e].className = 'lychee-radio active';

						newActive = e;

					}

				}

			}


			if (newActive !== null) {

				this.__active = newActive;
				this.__callback.call(this.__scope, this.__values[newActive]);

				return true;

			}


			return false;

		},

		addTo: function(element) {
			if (element instanceof HTMLElement) {
				element.appendChild(this.__element);
			}
		}

	};


	return Class;

});

