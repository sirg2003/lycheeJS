
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
				base + '/img/font_64_white.png',
				base + '/img/font_48_white.png',
				base + '/img/font_18_white.png'
			];


			this.preloader = new lychee.Preloader(urls, {
				timeout: 3000
			});

			this.preloader.bind('ready', function(assets) {

				this.assets = assets;

				this.fonts.headline = new lychee.Font(assets[urls[0]], {
					kerning: 0,
					spacing: 4,
					map: [18,23,37,37,46,55,51,23,32,37,37,37,23,37,23,37,46,32,46,46,46,46,46,51,46,46,23,23,37,37,41,41,51,46,46,46,46,41,41,46,46,23,46,51,41,55,46,46,46,46,46,46,46,46,51,65,51,46,51,27,41,32,37,27,23,41,41,41,41,41,37,41,41,23,27,41,23,60,41,41,41,41,37,41,32,41,41,60,41,41,41,32,18,37,37]
				});


				this.fonts.normal = new lychee.Font(assets[urls[1]], {
					kerning: 0,
					spacing: 4,
					map: [14,17,28,28,35,42,38,17,24,28,28,28,17,28,17,28,35,24,35,35,35,35,35,38,35,35,17,17,28,28,31,31,38,35,35,35,35,31,31,35,35,17,35,38,31,42,35,35,35,35,35,35,35,35,38,49,38,35,38,21,31,24,28,21,17,31,31,31,31,31,28,31,31,17,21,31,17,45,31,31,31,31,28,31,24,31,31,45,31,31,31,24,14,28,28]
				});


				this.fonts.small = new lychee.Font(assets[urls[2]], {
					kerning: 0,
					spacing: 4,
					map: [3,4,8,8,11,14,12,4,7,8,8,8,4,8,4,8,11,7,11,11,11,11,11,12,11,11,4,4,8,8,10,10,12,11,11,11,11,10,10,11,11,4,11,12,10,14,11,11,11,11,11,11,11,11,12,16,12,11,12,6,10,7,8,6,4,10,10,10,10,10,8,10,10,4,6,10,4,15,10,10,10,10,8,10,7,10,10,15,10,10,10,7,3,8,8]
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
