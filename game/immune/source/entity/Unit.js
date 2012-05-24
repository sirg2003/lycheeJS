
lychee.define('game.entity.Unit').exports(function(lychee, global) {

	var _id = 0;

	var Class = function(properties) {

		this.id = 'unit' + _id++;
		this.team = 'neutral';

		this.damage = 0;
		this.health = 100;
		this.speed  = 100;

		this.radius = 8;
		this.position = {
			x: 0, y: 0
		};

		lychee.extend(this, properties);


		this.__attack = null;
		this.__tween = null;
		this.__clock = null;

		this.__position = {};
		this.__offset = {
			start: Math.random(),
			t: 0,
			x: 0,
			y: 0
		};

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */
		__sync: function(now) {

			this.__clock = now;

			if (this.__tween !== null) {
				this.__tween.start = now;
			}

		},

		update: function(clock, delta) {

			if (this.__clock === null) {
				this.__sync(clock);
			}


			var t = 0;
			if (
				this.__tween !== null
				&& (this.__clock <= this.__tween.start + this.__tween.duration)
				&& this.__tween.duration !== 0
			) {

				t = (this.__clock - this.__tween.start) / this.__tween.duration;

				this.position.x = this.__tween.from.x + t * (this.__tween.to.x - this.__tween.from.x);
				this.position.y = this.__tween.from.y + t * (this.__tween.to.y - this.__tween.from.y);

			} else if (this.__tween !== null) {

				// This case is for having not enough update
				// for tween to be finished in time.
				this.position.x = this.__tween.to.x;
				this.position.y = this.__tween.to.y;
				this.__tween = null;

			}


			if (this.__attack !== null) {

				if (this.__attack.victim.team === this.team) {

					this.__attack.callback.call(this.__attack.scope);
					this.__attack = null;

				} else if (this.__attack.victim.health > 0) {

					var damage = delta * this.damage / 1000;
					if (!isNaN(damage)) {
						this.__attack.victim.damage(damage, this.team);
					}

				}

			}


			this.__offset.t = (this.__clock % 1000 / 300) + this.__offset.start;
			this.__offset.x = Math.sin(this.__offset.t * Math.PI * 2);
			this.__offset.y = Math.cos(this.__offset.t * Math.PI * 2);

			this.__clock = clock;

		},



		/*
		 * PUBLIC API
		 */
		getPosition: function() {

			this.__position.x = this.position.x + this.__offset.x;
			this.__position.y = this.position.y + this.__offset.y;


			return this.__position;

		},

		setPosition: function(position) {

			this.position.x = position.x || this.position.x;
			this.position.y = position.y || this.position.y;

			return true;

		},

		attack: function(enemy, callback, scope) {

			this.__attack = {
				victim: enemy,
				callback: callback || function() {},
				scope: scope || this
			};

			if (enemy.team === this.team) {
				this.__attack.callback.call(this.__attack.scope);
				this.__attack = null;
			}

		},


		move: function(position) {

			var deltaX = position.x - this.position.x;
			var deltaY = position.y - this.position.y;

			var distance = Math.sqrt( Math.pow(Math.abs(deltaX), 2) + Math.pow(Math.abs(deltaY), 2) );
			var time = 1000 * distance / this.speed;

			if (time === Infinity) {
				return null;
			}

			this.tween(time, {
				x: position.x,
				y: position.y
			});


			return time;

		},

		stop: function() {
			this.__attack = null;
			this.__tween = null;
		},

		tween: function(duration, position) {

			duration = typeof duration === 'number' ? duration : 0;

			var tween = null;
			if (Object.prototype.toString.call(position) === '[object Object]') {

				position.x = typeof position.x === 'number' ? position.x : this.position.x;
				position.y = typeof position.y === 'number' ? position.y : this.position.y;


				tween = {
					start: this.__clock,
					duration: duration,
					from: {
						x: this.position.x,
						y: this.position.y
					},
					to: position
				};

			}


			this.__tween = tween;

		},

		isAttacking: function() {
			return this.__attack !== null;
		},

		isIdle: function() {

			if (
				this.__attack === null
				&& this.__tween === null
			) {
				return true;
			}


			return false;

		},

		isTeam: function(team) {
			return this.team === team;
		}

	};


	return Class;

});

