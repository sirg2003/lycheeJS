
lychee.define('Preloader').tags({
	platform: 'html'
}).requires([
]).includes([
	'lychee.Events'
]).exports(function(lychee, global) {

	var _loading = {},
		_assets = {},
		_globalIntervalId = null;

	var Class = function(urls, settings) {

		urls = Object.prototype.toString.call(urls) === '[object Array]' ? urls : null;

		this.settings = lychee.extend({}, this.defaults, settings);

		this.__lastLoadStart = null;

		lychee.Events.call(this, 'preloader');


		if (urls !== null) {
			this.load(urls);
		}

	};


	Class.prototype = {

		defaults: {
			interval:  100,
			timeout:  5000
		},

		load: function(urls) {

			this.__lastLoadStart = Date.now();

			if (Object.prototype.toString.call(urls) !== '[object Array]') {
				urls = [ urls ];
			}

			if (_globalIntervalId === null) {

				var that = this;
				_globalIntervalId = global.setInterval(function() {
					that.__loop();
				}, this.settings.interval);

			}


			for (var u = 0, l = urls.length; u < l; u++) {

				var url = urls[u];
				var tmp = url.split(/\./);
				var ext = tmp[tmp.length - 1];

				this.__load(url, ext);

			}

		},

		__loop: function() {

			var isReady = true;

			var url;
			for (url in _loading) {
				if (_assets[url] === undefined) {
					isReady = false;
				}
			}


			var timedOut = false;
			if (this.__lastLoadStart !== null) {
				timedOut = Date.now() >= this.__lastLoadStart + this.settings.timeout;
			}


			if (isReady === true) {

				global.clearInterval(_globalIntervalId);
				_globalIntervalId = null;

				this.trigger('ready', [ _assets ]);


			} else if (timedOut && _globalIntervalId !== null) {

				var filtered = [];
				for (url in _loading) {
					if (_loading[url] === true) {
						filtered.push(url);
					}
				}

				global.clearInterval(_globalIntervalId);
				_globalIntervalId = null;

				if (filtered.length) {
					this.trigger('error', [ filtered ]);
				} else {
					this.trigger('ready', [ _assets ]);
				}

			}

		},

		__load: function(url, type) {

			var that = this;

			if (type.match(/jpg|jpeg|png|bmp|gif/)) {

				_loading[url] = true;

				var img = new Image();
				img.onload = function() {
					_loading[url] = false;
					_assets[url] = this;
				};
				img.src = url;

			} else if (type === 'json') {

				_loading[url] = true;

				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');

				xhr.onreadystatechange = function() {

					if (xhr.readyState === 4) {

						var data = null;
						try {
							data = JSON.parse(xhr.responseText);
						} catch(e) {
							console.warn('JSON file at ' + url + ' is invalid.');
						}


						if (data !== null) {
							_loading[url] = false;
							_assets[url] = data;
						} else {
							_loading[url] = false;
						}

					}

				};

				xhr.send(null);

			} else {

				_loading[url] = true;

				var xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);

				xhr.onreadystatechange = function() {

					if (xhr.readyState === 4 && xhr.status === 200 || xhr.status === 304) {

						var data = xhr.responseText || xhr.responseText || null;

						if (data !== null) {
							_loading[url] = false;
							_assets[url] = data;
						} else {
							_loading[url] = false;
						}

					}

				};

				xhr.send(null);

			}

		}

	};


	return Class;

});

