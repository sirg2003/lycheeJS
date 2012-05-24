
lychee.define('Font').exports(function(lychee) {

	var Class = function(sprite, settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		this.__cache = {};

		if (sprite instanceof Image) {
			this.sprite = sprite;
		}

		this.__init();

	};


	Class.prototype = {

		defaults: {
			// default charset from 32-126
			charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
			spacing: 0,
			kerning: 0,
			widthMap: null
		},

		__init: function() {

			var offset = 0;

			for (var c = 0, l = this.settings.charset.length; c < l; c++) {

				var chr = {
					id: this.settings.charset[c],
					width: this.settings.widthMap[c],
					height: this.sprite.height,
					x: offset - this.settings.kerning,
					y: 0
				};

				offset += chr.width + 1 + this.settings.spacing * 2;

				this.__cache[chr.id] = chr;

			}

		},

		get: function(id) {

			if (this.__cache[id] !== undefined) {
				return this.__cache[id];
			}


			return null;

		}

	};


	return Class;

});

