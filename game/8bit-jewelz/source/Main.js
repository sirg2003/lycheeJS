
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
				base + '/img/font_48_white.png',
				base + '/img/font_32_white.png',
				base + '/img/font_16_white.png',
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
					kerning: -2,
					spacing: 14,
					map: [14,18,22,34,26,62,46,14,18,22,29,34,17,30,16,18,38,20,37,34,36,35,37,31,36,33,16,18,28,34,28,29,52,39,41,34,47,39,29,35,37,17,29,32,29,44,35,40,29,39,37,40,29,37,28,50,31,32,35,18,19,21,27,33,25,25,26,21,26,25,17,25,25,15,15,25,15,36,25,25,24,25,22,21,17,25,22,32,24,25,24,21,14,21,30]
				});


				this.fonts.normal = new lychee.Font(assets[urls[1]], {
					kerning: 0,
					spacing: 12,
					map: [11,14,16,24,19,43,32,11,13,16,21,24,13,21,12,14,27,15,26,24,26,25,26,22,26,24,12,13,20,24,20,21,36,28,29,24,33,27,21,25,26,13,21,23,21,31,25,28,21,28,26,28,21,26,20,35,22,23,25,13,14,15,19,23,18,18,19,16,19,18,13,18,18,12,11,18,11,25,18,18,18,18,16,15,13,18,16,23,17,18,18,16,11,16,22]
				});

				this.fonts.small = new lychee.Font(assets[urls[2]], {
					kerning: 0,
					spacing: 14,
					map: [8,9,10,14,12,24,18,8,9,10,13,14,9,13,8,9,16,10,15,14,15,15,15,13,15,14,8,9,12,14,12,13,20,16,17,14,19,16,13,15,15,9,13,14,13,18,15,16,13,16,15,16,13,15,12,20,13,14,15,9,9,10,12,14,11,11,12,10,12,11,9,11,11,8,8,11,8,15,11,11,11,11,10,10,9,11,10,14,11,11,11,10,8,10,13]
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
