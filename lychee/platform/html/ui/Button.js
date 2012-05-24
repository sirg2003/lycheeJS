
lychee.define('lychee.ui.Button').tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var Class = function(desc, callback, scope) {

		callback = callback instanceof Function ? callback : function(){};
		scope = scope !== undefined ? scope : global;


		this.__element = document.createElement('button');
		this.__element.innerHTML = desc;
		this.__element.onclick = function() {
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

