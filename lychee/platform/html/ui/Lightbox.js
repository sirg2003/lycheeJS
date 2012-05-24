
lychee.define('lychee.ui.Lightbox').tags({
	platform: 'html'
}).requires([
	'lychee.ui.Button',
]).exports(function(lychee) {

	var Class = function(id, title) {

		id = typeof id === 'string' ? id : null;
		title = typeof title === 'string' ? title : null;


		this.__wrapper = document.createElement('div');
		this.__wrapper.className = 'lychee-lightbox hidden';
		if (id !== null) {
			this.__wrapper.id = id;
		}


		var header = document.createElement('header');
		this.__wrapper.appendChild(header);

		var article = document.createElement('article');
		this.__wrapper.appendChild(article);


		var desc = document.createElement('span');
		desc.innerHTML = title !== null ? title : '...';
		header.appendChild(desc);

		new lychee.ui.Button('X', function() {
			this.hide();
		}, this).addTo(header);
		// TODO: Evaluate if className = 'ly-lightbox-close' is necessary


		this.__title = desc;
		this.__content = article;

	};


	Class.prototype = {

		add: function(content) {

			if (content && content.addTo instanceof Function) {
				content.addTo(this.__content);
			} else if (content instanceof HTMLElement) {
				this.__content.appendChild(content);
			} else if (typeof content === 'string') {
				this.__content.innerHTML += content;
			}

		},

		addTo: function(element) {

			if (element instanceof HTMLElement) {
				element.appendChild(this.__wrapper);
			}

		},

		destroy: function() {

			var parent = this.__wrapper.parentNode;
			if (parent !== null) {
				parent.removeChild(this.__wrapper);
			}

		},

		hide: function() {
			this.__wrapper.className = 'lychee-lightbox hidden';
		},

		show: function() {
			this.__wrapper.className = 'lychee-lightbox';
		},

		title: function(title) {
			title = typeof title === 'string' ? title : '...';
			this.__title.innerHTML = title;
		}

	};


	return Class;

});

