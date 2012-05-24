
lychee.define('lychee.ui.Select').tags({
	platform: 'html'
}).requires([
	'lychee.ui.Option'
]).exports(function(lychee, global) {

	var Class = function(callback, scope) {

		callback = callback instanceof Function ? callback : function(){};
		scope = scope !== undefined ? scope : global;


		this.__element = document.createElement('select');


		this.__element.onchange = function() {

			var value = this.options[this.selectedIndex].value;
			var retValue = callback.call(scope, value);

			if (retValue !== value) {

				for (var o = 0, l = this.options.length; o < l; o++) {

					var option = this.options[o];
					if (option.value === retValue) {
						option.setAttribute('selected', 'selected');
					} else {
						option.removeAttribute('selected');
					}

				}

			}

		};

	};


	Class.prototype = {

		add: function(option) {

			if (option instanceof lychee.ui.Option) {
				this.__element.appendChild(option.element);
			}

		},

		addTo: function(element) {

			if (element instanceof HTMLElement) {
				element.appendChild(this.__element);
			}

		},

		get: function() {

			var index = this.__element.selectedIndex;
			if (index > 0) {
				return this.__element.options[index].value;
			} else if (this.__element.value !== undefined) {
				return this.__element.value;
			}


			return null;

		},

		set: function(value) {

			var options = this.element.options,
				oldIndex = this.element.selectedIndex,
				oldOption = null;

			if (oldIndex > 0) {
				oldOption = options[oldIndex];
			}


			if (oldOption === null || oldOption.value !== value) {

				for (var o = 0, l = options.length; o < l; o++) {

					var newOption = options[o];
					if (newOption.value === value) {

						if (oldOption !== null) {
							oldOption.removeAttribute('selected');
						}

						newOption.setAttribute('selected', 'selected');
						this.__element.selectedIndex = o;

						break;

					}

				}

			}

		}

	};


	return Class;

});

