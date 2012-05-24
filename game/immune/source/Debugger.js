
lychee.define('game.Debugger').requires([
	'lychee.ui.Button'
]).exports(function(lychee, global) {

	var Class = function(game) {

		this.game = game;

		this.__init();

	};


	Class.prototype = {

		__init: function() {

			var element = document.createElement('div');
			element.id = 'debugger';


			for (var id in game.skirmish) {

				(function(id, that, element) {

					new lychee.ui.Button('Play skirmish.' + id, function() {
						this.game.setState('game', {
							type: 'skirmish',
							id: id
						});
					}, that).addTo(element);

					new lychee.ui.Button('Edit skirmish.' + id, function() {
						this.game.setState('editor', {
							type: 'skirmish',
							id: id
						});
					}, that).addTo(element);

				})(id, this, element);

			}


			for (var id in game.campaign) {

				(function(id, that, element) {

					new lychee.ui.Button('Play campaign.' + id, function() {
						this.game.setState('game', {
							type: 'campaign',
							id: id
						});
					}, that).addTo(element);

					new lychee.ui.Button('Edit campaign.' + id, function() {
						this.game.setState('editor', {
							type: 'campaign',
							id: id
						});
					}, that).addTo(element);

				})(id, this, element);

			}


			new lychee.ui.Button('INSTANT WIN', function() {

				var winner = this.game.settings.team;

				var cells = this.game.logic.getCells();
				for (var c in cells) {

					var vesicles = cells[c].getVesicles();
					for (var v in vesicles) {
						vesicles[v].team = winner;
					}

				}


				var level = this.game.states.game.__level;
				if (level !== null) {

					level.__currentObjective = null;
					level.__nextObjectiveAvailable = false;

				}

			}, this).addTo(element);


			document.body.appendChild(element);

		}

	};


	return Class;

});

