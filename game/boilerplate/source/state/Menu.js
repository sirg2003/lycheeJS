
lychee.define('game.state.Menu').includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__headline = null;
		this.__current = null;
		this.__entities = [];
		this.__locked = false;

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

							return {
								desc: 'Fullscreen: ' + (this.game.settings.fullscreen === true ? 'On' : 'Off')
							};

						}
					}
   				}
			};

			this.__headline = new game.entity.Text(
				'',
				this.game.fonts.headline, {
					position: {
						x: 'center',
						y: -200
					}
				}
			);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

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

			this.__headline.update(clock, delta);

			for (var e = 0, l = this.__entities.length; e < l; e++) {
				if (this.__entities[e] === null) continue;
				this.__entities[e].update(clock, delta);
			}

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			this.__renderer.clock(clock, delta);

			this.__renderer.renderText(this.__headline);

			for (var e = 0, l = this.__entities.length; e < l; e++) {
				if (this.__entities[e] === null) continue;
				this.__renderer.renderText(this.__entities[e]);
			}

			this.__renderer.drawText(
				'powered by lycheeJS',
				'center',
				this.game.settings.height - 40,
				this.game.fonts.small,
				null
			);

		},

		setMenu: function(id) {

			if (
				this.__menus[id] !== undefined
				&& this.__current !== this.__menus[id]
			) {

				this.__locked = true;

				var headline = id.charAt(0).toUpperCase() + id.substr(1);

				// FIXME: This is kinda hacky.
				if (headline === 'Welcome') {
					headline = 'Boilerplate';
				}


				this.__headline.setText(headline);
				this.__headline.setPosition({
					y: -200
				});

				this.__headline.setTween(500, {
					y: this.__margin.y - 100
				}, lychee.game.Entity.TWEEN.bounceEaseOut);


				this.__current = this.__menus[id];
				this.__entities = [];

				var i = 0;
				for (var mId in this.__current) {

					var entry = this.__current[mId];

					var entity = new game.entity.Text(
						entry.desc,
						this.game.fonts.normal, {
							position: {
								x: 'center',
								y: this.game.settings.height + 200
							}
						}
					);

					this.__entities.push(entity);

					(function(that, entity, i) {

						that.__loop.timeout(500 + i * 200, function() {
							entity.setTween(500, {
							y: this.__margin.y + 50 * i + 6
							}, lychee.game.Entity.TWEEN.easeOut);
						}, that);

					})(this, entity, i++);

				}

				this.__loop.timeout(1000 + i * 200, function() {
					this.__locked = false;
				}, this);

			}

		},

		__processTouch: function(position, delta) {

			if (this.__locked === true) return;


			var offset = this.game.getOffset(),
				width = this.game.settings.width,
				height = this.game.settings.height;


			position.x -= offset.x;
			position.y -= offset.y;


			var i = 0;
			for (var mId in this.__current) {

				var submenu = this.__current[mId];

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
							this.game.jukebox.play('click');
						}

						this.setMenu(submenu.href);
						return;

					} else if (submenu.callback !== undefined) {

						if (this.game.settings.sound === true) {
							this.game.jukebox.play('click');
						}

						var retMenu = submenu.callback.call(this);
						if (Object.prototype.toString.call(retMenu) === '[object Object]') {
							if (typeof retMenu.desc === 'string') {
								this.__entities[i].setText(retMenu.desc);
							}
						}

						return;

					}

				}

				i++;

			}


			if (
				position.x > 0 && position.x < this.game.settings.width
				&& position.y > 0 && position.y < this.game.settings.height
			) {
				// Nothing found, so return to menu
				this.setMenu('welcome');
			}

		}

	};


	return Class;

});

