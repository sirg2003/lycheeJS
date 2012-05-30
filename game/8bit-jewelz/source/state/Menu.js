
lychee.define('game.state.Menu').includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__renderer = this.game.renderer;

		this.__menu = null;
		this.__jewels = null;

		this.__margin = {
			x: 50,
			y: 150
		};

		this.init();

	};


	Class.prototype = {

		init: function() {

			this.__menus = {
				welcome: {
					'playgame': {
						desc: 'Play Game',
						callback: function() {
							this.game.setState('game');
						}
					},
					'settings': {
						desc: 'Settings',
						href: 'settings'
					},
					'credits': {
						desc: 'Credits',
						callback: function() {
							this.game.setState('credits');
						}
					}
				},
				settings: {
					'music': {
						desc: 'Music: ' + (this.game.settings.music === true ? 'On' : 'Off'),
						callback: function() {

							if (this.game.settings.music === true) {
								this.game.set('music', false);
							} else {
								this.game.set('music', true);
							}


							return {
								desc: 'Music: ' + (this.game.settings.music === true ? 'On' : 'Off')
							};

						}
					},
					'sound': {
						desc: 'Sound: ' + (this.game.settings.sound === true ? 'On' : 'Off'),
						callback: function() {

							if (this.game.settings.sound === true) {
								this.game.set('sound', false);
							} else {
								this.game.set('sound', true);
							}


							return {
								desc: 'Sound: ' + (this.game.settings.sound === true ? 'On' : 'Off')
							};

						}
					},
					'fullscreen': {
						desc: 'Fullscreen: ' + (this.game.settings.fullscreen === true ? 'On' : 'Off'),
						callback: function() {

							if (this.game.settings.fullscreen === true) {
								this.game.set('fullscreen', false);
							} else {
								this.game.set('fullscreen', true);
							}

							this.game.reset();

							var state = this.game.getState();
							if (state) {
								state.leave && state.leave();
								state.enter && state.enter();
								state.setMenu('settings');
							}

							return {
								desc: 'Fullscreen: ' + (this.game.settings.fullscreen === true ? 'On' : 'Off')
							};

						}
					}
   				}
			};

		},

		__createDecoJewelz: function() {

			var width = this.game.settings.width;

			this.__jewels = [];

			var jewel;

			jewel = new game.entity.Jewel();
			jewel.setPosition({
				x: 155,
				y: 230
			});
//			jewel.setEffect(5000, lychee.game.Entity.EFFECT.wobble, {
//				x: 3
//			}, undefined, true);
			this.__jewels.push(jewel);

			jewel = new game.entity.Jewel();
			jewel.setPosition({
				x: 180,
				y: 170
			});
//			jewel.setEffect(7000, lychee.game.Entity.EFFECT.wobble, {
//				y: -2
//			}, undefined, true);
			this.__jewels.push(jewel);

			jewel = new game.entity.Jewel();
			jewel.setPosition({
				x: 95,
				y: 195
			});
//			jewel.setEffect(9000, lychee.game.Entity.EFFECT.wobble, {
//				y: 3
//			}, undefined, true);
			this.__jewels.push(jewel);

			jewel = new game.entity.Jewel();
			jewel.setPosition({
				x: width - 95,
				y: 195
			});
//			jewel.setEffect(7000, lychee.game.Entity.EFFECT.wobble, {
//    			y: 3
//			}, undefined, true);
			this.__jewels.push(jewel);

			jewel = new game.entity.Jewel();
			jewel.setPosition({
				x: width - 185,
				y: 235
			});
//			jewel.setEffect(5000, lychee.game.Entity.EFFECT.wobble, {
//				x: -3
//			}, undefined, true);
			this.__jewels.push(jewel);

			this.__jewels.reverse();

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			if (this.game.settings.width > 600) {
				this.__createDecoJewelz();
			}

			this.setMenu('welcome');

			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			if (this.__jewels !== null) {
				for (var j = 0; j < this.__jewels.length; j++) {
					this.__jewels[j].update(clock, delta);
				}
			}

		},

		render: function() {

			this.__renderer.clear();


			if (this.__menu !== null) {

				var menu = this.__menus[this.__menu];
				var width = this.game.settings.width;
				var height = this.game.settings.height;

				var headline = this.__menu.charAt(0).toUpperCase() + this.__menu.substr(1);

				var headlineFont = this.game.fonts.headline;
				var normalFont = this.game.fonts.normal;


				if (headline === 'Welcome') {
					headline = '8BIT - Jewelz';
				}

				if (width <= 320) {
					headlineFont = this.game.fonts.normal;
				}


				this.__renderer.drawText(
					headline,
					'center',
					60,
					headlineFont,
					null
				);


				var i = 0;
				for (var mId in menu) {

					var entry = menu[mId];

					this.__renderer.drawText(
						entry.desc,
						'center',
						this.__margin.y + 50 * i + 6,
						normalFont,
						null
					);

					i++;

				}

			}


			if (this.__jewels !== null) {
				for (var j = 0; j < this.__jewels.length; j++) {
					this.__renderer.renderJewel(this.__jewels[j]);
				}
			}

			this.__renderer.drawText(
				'powered by lycheeJS',
				'center',
				height - 40,
				this.game.fonts.small,
				null
			);

		},

		setMenu: function(id) {

			if (this.__menus[id] !== undefined) {
				this.__menu = id;
			}

		},

		__processTouch: function(position, delta) {

			if (this.__menu === null) {
				this.setMenu('welcome');
				return;
			}

			var menu = this.__menus[this.__menu],
				offset = this.game.getOffset(),
				width = this.game.settings.width,
				height = this.game.settings.height;

			position.x -= offset.x;
			position.y -= offset.y;


			var i = 0;
			for (var mId in menu) {

				var submenu = menu[mId];

				var box = {
					x1: width * 1/4,
					x2: width * 3/4,
					y1: this.__margin.y + 50 * i,
					y2: this.__margin.y + 50 * (i + 1)
				};


				if (
					position.x > box.x1
					&& position.x < box.x2
					&& position.y > box.y1
					&& position.y < box.y2
				) {

					if (submenu.href !== undefined) {

						if (this.game.settings.sound === true) {
							this.game.jukebox.play('menuclick');
						}

						this.setMenu(submenu.href);

					}

					if (submenu.callback !== undefined) {

						if (this.game.settings.sound === true) {
							this.game.jukebox.play('menuclick');
						}

						var retMenu = submenu.callback.call(this);
						if (Object.prototype.toString.call(retMenu) === '[object Object]') {
							if (typeof retMenu.desc === 'string') {
								submenu.desc = retMenu.desc;
							}
						}

					}

				}

				i++;

			}


			if (position.y < this.__margin.y) {
				this.setMenu('welcome');
			}

		}

	};


	return Class;

});
