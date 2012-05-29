
lychee.define('tool.Font').tags({
	platform: 'html'
}).requires([
	'lychee.Font'
]).includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var Class = function(canvas) {

		this.__canvas = canvas instanceof HTMLCanvasElement ? canvas : document.createElement('canvas');
		this.__ctx = this.__canvas.getContext('2d');

		lychee.Events.call(this, 'fonttool');

	};

	Class.SPRITEMAP = {
		none: 0,
		x:    1,
		xy:   2
	};


	Class.prototype = {

		defaults: {
			font: 'Ubuntu',
			size: 32,
			color: '#933',
			style: 'normal',
			spacing: 1,
			outline: 1,
			outlineColor: '#000',
			firstChar: 33,
			lastChar: 127,
			spritemap: Class.SPRITEMAP.x
		},

		__updateFont: function() {

			this.__ctx.font = this.settings.style + ' ' + this.settings.size + 'px ' + '"' + this.settings.font + '"';
			this.__ctx.textBaseline = 'top';

		},

		__clear: function() {
			this.__ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
		},

		__render: function(charset, widthMap, offsetY) {

			offsetY = typeof offsetY === 'number' ? offsetY : 0;

			this.__ctx.fillStyle = this.settings.color;

			for (var c = 0, margin = this.settings.spacing; c < charset.length; c++) {
				this.__ctx.fillText(charset[c], margin - 1, offsetY);
				margin += widthMap[c] + this.settings.spacing * 2;
			}

		},

		__renderOutline: function(charset, widthMap, offsetY) {

			offsetY = typeof offsetY === 'number' ? offsetY : 0;

			this.__ctx.fillStyle = this.settings.outlineColor;

			var outline = this.settings.outline;

			for (var c = 0, margin = this.settings.spacing; c < charset.length; c++) {

				for (var x = -1 * outline; x <= outline; x++) {
					for (var y = -1 * outline; y <= outline; y++) {
						this.__ctx.fillText(charset[c], margin + x - 1, offsetY + y);
					}
				}

				margin += widthMap[c] + this.settings.spacing * 2;

			}

		},

		__getMargin: function() {

			var width = this.__canvas.width,
				height = this.__canvas.height;


			var data = this.__ctx.getImageData(0, 0, width, height);

			var margin = {
				top: 0,
				bottom: 0
			};

			var x, y, found = false;
			for (y = 0; y < height; y++) {

				found = false;

				for (x = 0; x < width; x++) {
					if (data.data[y * width * 4 + x * 4 + 3]) {
						found = true;
						break;
					}
				}

				if (found === true) {
					margin.top = y;
					break;
				}

			}


			for (y = height - 1; y >= 0; y--) {

				found = false;

				for (x = 0; x < width; x++) {
					if (data.data[y * width * 4 + x * 4 + 3]) {
						found = true;
						break;
					}
				}

				if (found === true) {
					margin.bottom = y + 1;
					break;
				}

			}


			return margin;

		},

		export: function(settings) {

			this.settings = lychee.extend({}, this.defaults, settings);

			var charset = [];
			for (var c = this.settings.firstChar; c < this.settings.lastChar; c++) {
				charset.push(String.fromCharCode(c));
			}


			this.__updateFont();


			// 1. Measure the approximate the canvas dimensions
			var width = this.settings.spacing,
				widthMap = [];

			for (var i = 0; i < charset.length; i++) {

				var m = this.__ctx.measureText(charset[i]);
				var charWidth = Math.max(1, Math.ceil(m.width)) + this.settings.outline * 2;

				widthMap.push(charWidth);
				width += charWidth + this.settings.spacing * 2;

			}


			// 2. Render it the first time to find out character heights
			this.__canvas.width = width;
			this.__canvas.height = this.settings.size * 3;
			this.__updateFont();

			this.__clear();

			if (this.settings.outline > 0) {
				this.__renderOutline(charset, widthMap, this.settings.size);
			}

			this.__render(charset, widthMap, this.settings.size);


			// 3. Rerender everything if we know that the font size differed from the actual height
			var margin = this.__getMargin();
			if (margin.top > 0 || margin.bottom > 0) {

				var height = this.__canvas.height;
				this.__canvas.height = height - margin.top - (height - margin.bottom);
				this.__updateFont();

				this.__clear();

				if (this.settings.outline > 0) {
					this.__renderOutline(charset, widthMap, this.settings.size - margin.top);
				}

				this.__render(charset, widthMap, this.settings.size - margin.top);

			}

			// 4. Generate the actual settings for lychee.Font usage.
			var sprite = new Image();
			sprite.src = this.__canvas.toDataURL('image/png');



			var settings = {
				charset: charset.join(''),
				kerning: 0,
				spacing: this.settings.spacing
			};


			var that = this;
			sprite.onload = function() {
				that.__draw(this, that.__canvas.width, that.__canvas.height, settings, widthMap);
			};

		},


		__draw: function(sprite, width, height, settings, widthMap) {

			switch (this.settings.spritemap) {

				case Class.SPRITEMAP.none:

					var images = [];
					var height = this.__canvas.height;
					var outline = this.settings.outline;

					for (var w = 0, margin = this.settings.spacing, l = widthMap.length; w < l; w++) {

						var frameWidth = widthMap[w];

						this.__canvas.width = frameWidth;
						this.__canvas.height = height;

						this.__ctx.drawImage(
							sprite,
							margin - this.settings.spacing,
							0,
							frameWidth,
							height,
							0,
							0,
							frameWidth,
							height
						);


						var image = new Image();
						image.src = this.__canvas.toDataURL('image/png');

						images.push(image);

						margin += frameWidth + this.settings.spacing * 2;

					}


					this.trigger('ready', [{
						sprite: sprite,
						images: images,
						settings: JSON.stringify(settings)
					}]);

				break;


				case Class.SPRITEMAP.x:

					settings.map = widthMap;

					this.trigger('ready', [{
						sprite: sprite,
						settings: JSON.stringify(settings)
					}]);

				break;

				case Class.SPRITEMAP.xy:

					// 1. Determination of best matching sprite width
					var spriteWidth = Math.round(Math.sqrt(width * height));
					var spriteHeight = height;


					// 2. Determination of sprite height && generation of spritemap
					var spriteMap = [];
					var offsetX = 0;
					var offsetY = 0;
					var srcOffset = 0;
					for (var w = 0, l = widthMap.length; w < l; w++) {

						var frame = {
							width: widthMap[w],
							height: height,
							sx: srcOffset,
							sy: 0,
							dx: offsetX,
							dy: offsetY
						};

						spriteMap.push(frame);


						srcOffset += frame.width + this.settings.spacing * 2;
						offsetX += frame.width + this.settings.spacing;


						var nextFrameWidth = 0;
						if (widthMap[w + 1] !== undefined) {
							nextFrameWidth = widthMap[w + 1];
						}


						if (offsetX + nextFrameWidth > spriteWidth) {
							offsetX = 0;
							offsetY += height;
							spriteHeight += height;
						}

					}


					// 3. Re-draw the sprite image
					this.__canvas.width = spriteWidth;
					this.__canvas.height = spriteHeight;


					for (var s = 0, l = spriteMap.length; s < l; s++) {

						var frame = spriteMap[s];

						this.__ctx.drawImage(
							sprite,
							frame.sx,
							frame.sy,
							frame.width,
							frame.height,
							frame.dx,
							frame.dy,
							frame.width,
							frame.height
						);

					}


					// 4. Regenerate sprite image (data)
					sprite = new Image();
					sprite.src = this.__canvas.toDataURL('image/png');


					// 5. Regenerate sprite map
					widthMap = [];

					for (var s = 0, l = spriteMap.length; s < l; s++) {

						var frame = spriteMap[s];

						widthMap.push({
							width: frame.width,
							height: frame.height,
							x: frame.dx,
							y: frame.dy
						});

					}


					settings.map = widthMap;


					this.trigger('ready', [{
						sprite: sprite,
						settings: JSON.stringify(settings)
					}]);


					break;


				default:
					return null;

			}

		}

	};


	return Class;

});

