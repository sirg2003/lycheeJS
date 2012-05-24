
lychee.define('lychee.ui.Input').tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var Class = function(type, value, callback, scope) {

		var that = this;

		callback = callback instanceof Function ? callback : function(){};
		scope = scope !== undefined ? scope : global;


		this.__element = document.createElement('input');

		if (type === 'number') {

			this.__element.type = 'number';
			this.__element.value = value;

			this.__value = value;

			this.__element.onblur = function() {

				var newValue = parseInt(this.value, 10);
				if (isNaN(newValue)) {
					this.value = that.__value;
				} else {

					var retValue = callback.call(scope, newValue);
					if (retValue !== newValue && typeof retValue === 'number') {
						that.__value = retValue;
						this.value = that.__value;
					} else if (retValue === false) {
						this.value = that.__value;
					} else {
						that.__value = this.value;
					}

				}

			};

		} else if (type === 'text') {

			this.__element.type = 'text';
			this.__element.value = value;

			this.__value = value;

			this.__element.onblur = function() {

				var retValue = callback.call(scope, this.value);
				if (retValue !== this.value && typeof retValue === 'string') {
					that.__value = retValue;
					this.value = that.__value;
				} else if (retValue === false) {
					this.value = that.__value;
				} else {
					that.__value = this.value;
				}
			};

		}

	};


	Class.prototype = {

		addTo: function(element) {
			if (element instanceof HTMLElement) {
				element.appendChild(this.__element);
			}
		},

		get: function() {
			return this.__element.value || null;
		},

		set: function(value) {
			this.__value = value;
			this.__element.value = value;
		}

	};


	return Class;

});

