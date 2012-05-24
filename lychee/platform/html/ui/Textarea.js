
lychee.define('lychee.ui.Textarea').tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var Class = function(content, callback, scope) {

		callback = callback instanceof Function ? callback : function(){};
		scope = scope !== undefined ? scope : global;


		this.__element = document.createElement('textarea');
		this.__element.value = content;
		this.__element.onblur = function() {
			callback.call(scope);
		};

	};


	Class.prototype = {

		addTo: function(element) {
			if (element instanceof HTMLElement) {
				element.appendChild(this.__element);
			}
		}

	};


	return Class;

});

