
lychee.define('game.Main').requires([
	'lychee.Font',
	'lychee.Input',
	'lychee.Preloader',
	'game.Debugger',
	'game.Jukebox',
	'game.Level',
	'game.Renderer',
	'game.campaign.Immune1',
	'game.campaign.Immune2',
	'game.logic.Main',
	'game.skirmish.Roundabout',
	'game.state.Campaign',
	'game.state.Editor',
	'game.state.Game',
	'game.state.GameOver',
	'game.state.Menu',
//	'game.state.Skirmish',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		lychee.game.Main.call(this, settings);

		this.fonts = {};
		this.sprite = null;

		this.load();

	};


	Class.prototype = {

		defaults: {
			title: 'Immune Game',
			base: './asset',
			sound: true,
			music: true,
			fullscreen: false,
			renderFps: 60,
			updateFps: 60,
			width: 1024,
			height: 600,
			palette: {
				neutral: '#fff',
				immune: '#00f',
				virus: '#f00'
			},
			spawntimeout: 1000,
			team: 'immune'
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


			var width = this.settings.width;
			var height = this.settings.height;

			if (this.settings.fullscreen === true) {
				width = global.innerWidth;
				height = global.innerHeight;
			}


			this.renderer.reset(width, height, true);

			this.renderer.context.style.width = width + 'px';
			this.renderer.context.style.height = height + 'px';


			this.layers = {
				game: {
					type: 'dynamic',
					width: width,
					height: height * 0.8,
					offset: {
						x: 0, y: 0
					}
				},
				statusbar: {
					type: 'static',
					width: width,
					height: height * 0.2,
					offset: {
						x: 0, y: height * 0.8
					}
				}
			};


			// Wait for next callstack. Fuck reflow.
			this.loop.timeout(0, function() {
				this.getOffset(true);
			}, this);

		},

		init: function() {

			lychee.game.Main.prototype.init.call(this);


			this.renderer = new game.Renderer(this);
			this.reset();


			var wrapper = document.getElementById('game');
			wrapper.appendChild(this.renderer.context);


			this.jukebox = new game.Jukebox(this);

			this.input = new lychee.Input({
				delay: 0,
				fireModifier: true,
				fireSwipe: true
			});

			this.logic = new game.logic.Main(this);

			this.reset();

			this.states = {
				campaign: new game.state.Campaign(this),
				// skirmish: new game.state.Skirmish(this),
				editor:   new game.state.Editor(this),
				game:     new game.state.Game(this),
				gameover: new game.state.GameOver(this),
				menu:     new game.state.Menu(this)
			};


			if (lychee.debug === true) {
				this.debugger = new game.Debugger(this);
			}


			this.setState('menu');

			this.start();

		},

		offset: function(position, layer) {

			layer = layer || null;

			position.x -= this.renderer.context.offsetLeft;
			position.y -= this.renderer.context.offsetTop;

			if (layer !== null) {
				position.x -= layer.offset.x;
				position.y -= layer.offset.y;
			}

		},

		getOffset: function(reset) {

			if (this.__offset === undefined || reset === true) {
				this.__offset = {
					x: this.renderer.context.offsetLeft,
					y: this.renderer.context.offsetTop
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
