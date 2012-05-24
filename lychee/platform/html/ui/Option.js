
lychee.define('lychee.ui.Option').tags({
	platform: 'html'
}).exports(function(lychee, global) {

	var Class = function(desc, value) {

		desc = typeof desc === 'string' ? desc : null;
		value = typeof value === 'string' ? value : null;

		// Public, so lychee.ui.Select can access it.
		this.element = document.createElement('option');
		this.element.innerHTML = desc;
		this.element.value = value;

	};


	Class.prototype = {

		addTo: function(select) {

			if (select instanceof lychee.ui.Select) {
				select.add(this);
			}

		}

	};


	return Class;

});

