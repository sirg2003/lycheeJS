
lychee.define('game.Main').requires([
	'lychee.Font',
	'lychee.Input',
	'lychee.Preloader',
	'game.Jukebox',
	'game.Renderer',
	'game.state.Game',
	'game.state.Menu',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		lychee.game.Main.call(this, settings);

		this.fonts = {};
		this.sprite = null;
		this.map = null;

		this.load();

	};


	Class.prototype = {

		defaults: {
			base: './asset',
			sound: true,
			music: true,
			fullscreen: false,
			renderFps: 20,
			updateFps: 20,
			width: 896,
			height: 386
		},

		load: function() {

			var base = this.settings.base;

			var urls = [
				base + '/img/8bit_48_white.png',
				base + '/img/8bit_32_white.png',
				base + '/img/8bit_12_white.png'
			];


			this.preloader = new lychee.Preloader(urls, {
				timeout: 3000
			});

			this.preloader.bind('ready', function(assets) {

				this.assets = assets;

				this.fonts.headline = new lychee.Font(assets[urls[0]], {
					"charset": " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
					"kerning": 0,
					"spacing": 1,
					"widthMap": [24,19,22,48,31,46,43,13,24,24,48,40,15,16,15,16,48,24,48,48,48,48,48,48,48,48,16,16,40,40,40,26,48,48,48,48,48,48,48,48,48,24,48,48,48,72,48,48,48,48,48,48,48,48,48,72,48,48,48,24,16,24,40,24,24,48,48,48,48,48,48,48,48,24,48,48,48,72,48,48,48,48,48,48,48,48,48,72,48,48,48,31,16,31,40]
				});

				this.fonts.normal = new lychee.Font(assets[urls[1]], {
					"charset": " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
					"kerning": 0,
					"spacing": 1,
					"widthMap": [16,13,15,32,20,30,28,9,16,16,32,27,10,11,10,11,32,16,32,32,32,32,32,32,32,32,11,11,27,27,27,17,32,32,32,32,32,32,32,32,32,16,32,32,32,48,32,32,32,32,32,32,32,32,32,48,32,32,32,16,11,16,27,16,16,32,32,32,32,32,32,32,32,16,32,32,32,48,32,32,32,32,32,32,32,32,32,48,32,32,32,20,11,20,27]
				});

				this.fonts.small = new lychee.Font(assets[urls[2]], {
					"charset": " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
					"kerning": 0,
					"spacing": 1,
					"widthMap": [6,5,6,12,8,11,11,3,6,6,12,10,4,4,4,4,12,6,12,12,12,12,12,12,12,12,4,4,10,10,10,6,12,12,12,12,12,12,12,12,12,6,12,12,12,18,12,12,12,12,12,12,12,12,12,18,12,12,12,6,4,6,10,6,6,12,12,12,12,12,12,12,12,6,12,12,12,18,12,12,12,12,12,12,12,12,12,18,12,12,12,8,4,8,10]
				});


				this.init();

			}, this);

			this.preloader.bind('error', function(urls) {
				if (lychee.debug === true) {
					console.warn('Preloader error for these urls: ', urls);
				}
			}, this);

		},

		reset: function() {

			game.DeviceSpecificHacks.call(this);


			if (this.settings.fullscreen === true) {
				this.settings.width = global.innerWidth;
				this.settings.height = global.innerHeight;
			} else {
				this.settings.width = this.defaults.width;
				this.settings.height = this.defaults.height;
			}


			this.canvas.style.width = this.settings.width + 'px';
			this.canvas.style.height = this.settings.height + 'px';

			this.renderer.reset(this.settings.width, this.settings.height, true);

			this.getOffset(true);

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);

			this.renderer = new game.Renderer(this);
			this.renderer.reset(
				this.settings.width,
				this.settings.height,
				true, { map: this.map }
			);

			var canvas = this.renderer.context;
			var wrapper = document.getElementById('game');
			wrapper.appendChild(canvas);

			this.canvas = canvas;


			this.jukebox = new game.Jukebox(this);

			this.input = new lychee.Input({
				delay: 0,
				fireModifiers: true
			});


			this.reset();

			this.states = {
				game:    new game.state.Game(this),
				menu:    new game.state.Menu(this)
			};


			this.setState('menu');

			this.start();

		},

		getCanvas: function() {
			return this.canvas || null;
		},

		getOffset: function(reset) {

			if (this.__offset === undefined || reset === true) {
				this.__offset = {
					x: this.canvas.offsetLeft,
					y: this.canvas.offsetTop
				};
			}

			return this.__offset;

		},

		set: function(key, value) {

			if (this.settings[key] !== undefined) {

				if (value === null) {
					value = this.defaults[key];
				}

				this.settings[key] = value;

				return true;

			}

			return false;

		}

	};


	return Class;

});
