
lychee.define('lychee.ui.Checkbox').tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var Class = function(state, callback, scope) {

		state = state === true ? true : false;
		callback = callback instanceof Function ? callback : function(){};
		scope = scope !== undefined ? scope : global;


		this.__element = document.createElement('div');
		this.__state = state;

		this.set(this.__state);

		var that = this;
		this.__element.onclick = function() {

			if (that.__state === true) {
				that.__state = false;
			} else {
				that.__state = true;
			}

			that.set(that.__state);

			callback.call(scope, that.__state);

		};

	};


	Class.prototype = {

		set: function(state) {
			if (state === true) {
				this.__element.className = 'lychee-checkbox active';
			} else {
				this.__element.className = 'lychee-checkbox';
			}
		},

		addTo: function(element) {
			if (element instanceof HTMLElement) {
				element.appendChild(this.__element);
			}
		}

	};


	return Class;

});

