
lychee.define('game.Main').requires([
	'lychee.Font',
	'lychee.Input',
	'lychee.Preloader',
	'game.Board',
	'game.Sidebar',
	'game.Score',
	'game.Jukebox',
	'game.Renderer',
	'game.state.Credits',
	'game.state.Game',
	'game.state.Menu',
	'game.state.Result',
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
			play: {
				hits: 3,
				intro: 5000,
				hint: 2000,
				time: 30000
			},
			renderFps: 60,
			updateFps: 60,
			width: 896,
			height: 386,
			tile: 64
		},

		load: function() {

			var base = this.settings.base;
			var tile = this.settings.tile;

			var urls = [
				base + '/img/8bit_48_white.png',
				base + '/img/8bit_32_white.png',
				base + '/img/8bit_12_white.png',
				base + '/img/spritemap_32.png',
				base + '/img/spritemap_64.png',
				base + '/json/spritemap.json'
			];

			// TODO: Much more ...

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


				this.sprite = {
					32: assets[urls[3]],
					64: assets[urls[4]]
				};

				this.map = assets[urls[5]];

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
				this.settings.width = Math.floor(global.innerWidth / this.settings.tile) * this.settings.tile;
				this.settings.height = Math.floor(global.innerHeight / this.settings.tile) * this.settings.tile;
			} else {
				this.settings.width = this.defaults.width;
				this.settings.height = this.defaults.height;
			}


			this.settings.board = {
				width: Math.floor(this.settings.width / this.settings.tile) - 3,
				height: Math.floor(this.settings.height / this.settings.tile),
				tile: this.settings.tile
			};

			this.settings.sidebar = {
				width: 3 * this.settings.tile,
				height: this.settings.height,
				offset: {
					x: this.settings.board.width * this.settings.tile,
					y: 0
				}
			};

			this.canvas.style.width = this.settings.width + 'px';
			this.canvas.style.height = this.settings.height + 'px';

			this.renderer.reset(
				this.settings.width,
				this.settings.height,
				true, {
				sprite: this.sprite[this.settings.tile],
				tile: this.settings.tile
			});

			this.getOffset(true);

			this.board.resize(this.settings.board);
			this.sidebar.resize(this.settings.sidebar);

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

			this.score = new game.Score();

			this.board = new game.Board(this, this.settings.board);
			this.sidebar = new game.Sidebar(this, this.settings.sidebar);


			this.reset();

			this.states = {
				game:    new game.state.Game(this),
				result:  new game.state.Result(this),
				menu:    new game.state.Menu(this),
				credits: new game.state.Credits(this)
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
