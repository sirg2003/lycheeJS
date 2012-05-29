
lychee.define('lychee.Parser').requires([
	'lychee.Tokenizer'
]).exports(function(lychee, global) {

	function array_to_hash(array) {

		var hash = {};
		for (var a = 0, l = array.length; a < l; a++) {
			hash[array[a]] = true;
		}

		return hash;

	};

	function is_member(name, array) {

		for (var a = 0, l = array.length; a < l; a++) {
			if (array[a] === name) return true;
		}

		return false;

	};

	function is_token(token, type, value) {
		return token.type === type && (value == null || token.value === value);
	};

	var _ATOMIC_START_TOKENS = array_to_hash([
		'atom', 'name', 'num', 'regexp', 'string'
	]);

	var _STATEMENTS_WITH_LABELS = array_to_hash([
		'do', 'for', 'switch', 'while'
	]);

	var _UNARY_PREFIX = array_to_hash([
		'typeof', 'void', 'delete',
		'++', '--', '+', '-', '!', '~'
	]);

	var _UNARY_POSTFIX = array_to_hash([
		'++', '--'
	]);


	var _Node = function(name, start, end) {
		this.name = name;
		this.start = start;
		this.end = end;
	};

	_Node.prototype.toString = function() {
		return this.name;
	};



	var Class = function(source, exigentMode) {

		if (!source instanceof lychee.Tokenizer) {
			source = new lychee.Tokenizer(source, true);
		}

		exigentMode = exigentMode === true ? true : false;


		this.__source = source;

		this.__previous = null;
		this.__current = null;
		this.__peeked = null;

		this.__exigentMode = exigentMode;
		this.__currentLoop = 0;

		this.__current = this.next();

	};


	Class.prototype = {

		prev: function() {
			return this.__previous;
		},

		next: function() {

			this.__previous = this.__current;

			if (this.__peeked !== null) {
				this.__current = this.__peeked;
				this.__peeked = null;
			} else {
				this.__current = this.__source.next();
			}


			this.__inDirectives = this.__inDirectives === true && (
				this.__current.type === 'string' || is_token(this.__current, 'punc', ';')
			);


			return this.__current;

		},

		peek: function() {

			if (this.__peeked === null) {
				this.__peeked = this.__source.next();
			}


			return this.__peeked;

		},

		__process: function(value) {

			if (value instanceof Function) {
				value = value();
			}

			for (var a = 1, l = arguments.length; a < l; a++) {
				arguments[a]();
			}

			return value;

		},

		__throw: function(message) {

			throw new _Error(
				message,
				this.__current
			);

		},

		__throwUnexpected: function(token) {

			token = token !== undefined ? token : this.__current

			throw new _Error(
				'Unexpected Token: ' + token.type + ' (' + token.value + ')',
				token
			);

		},

		expect: function(type, value) {

			if (is_token(this.__current, type, value) === true) {
				return this.next();
			}


			this.__throw('Unexpected Token ' + this.__current.type + ', expected ' + type);

		},

		next: function() {

			if (
				is_token(this.__current, 'operator', '/') === true
				|| is_token(this.__current, 'operator', '/=') === true
			) {
				// Force RegExp
				this.__peeked = null;
				this.__current = this.__source.next(this.__current.value.substr(1));
			}


			switch (this.__current.type) {

				case "string":

					var directive = this.__inDirectives,
						statement = this.__simpleStatement();

					if (
						directive === true
						&& statement[1][0] === 'string'
						&& is_token(this.__current, 'punc', ',') === true
					) {
						return this.as('directive', statement[1][1]);
					}


					return statement;

				case "num":
				case "regexp":
				case "operator":
				case "atom":


					return this.__simpleStatement();

				case "name":

					if (is_token(this.peek(), 'punc', ':')) {
						var label = this.__process(this.__current.value, this.next, this.next);
						return this.__labeledStatement(label);
					}

					return this.__simpleStatement();

				case "punc":

					switch(this.__current.value) {

						case "{":
							return this.as('block', this.__block());

						case "[":
						case "(":
							return this.__simpleStatement();

						case ";":
							this.next();
							return this.as('block');

						default:
							this.__throwUnexpected();

					}

				case "keyword":

					switch(this.__process(this.__current.value, next)) {

						case "break":
							return this.__break_continue('break');

						case "continue":
							return this.__break_continue('continue');

						case "debugger":
							this.__semicolon();
							return this.as('debugger');

						case "do":

							return (function(body, that) {
								that.expect('keyword', 'while');
								return as ('do', that.__process(that.__parenthesised, that.__semicolon), body);
							})(this.__inLoop(this.next));

						case "for":
							return this.__for();

						case "function":
							return this.__function();

					}


			}

		},



		/*
		 * STUFF
		 */
		__canInsertSemicolon: function() {

			if (this.__exigentMode === false) {

				if (
					this.__current.newlinebefore === true
					|| is_token(this.__current, 'EOF')
					|| is_token(this.__current, 'punc', '}')
				) {
					return true;
				}

			}

			return false;

		},

		__labeledStatement: function(label) {

			this.__labels.push(label);

			var start = this.__current,
				statement = this.next();

			if (
				exigentMode === true
				&& Object.prototype.hasOwnProperty(_STATEMENTS_WITH_LABELS, statement[0]) === false
			) {
				this.__throwUnexpected(start);
			}

			this.__labels.pop();

			return this.as('label', label, statement);

		},

		__simpleStatement: function() {
			return this.as('stat', this.__process(this.__expression, this.__semicolon));
		},

		__inLoop: function(callback) {

			try {
				++this.__currentLoop;
				return callback();
			} finally {
				--this.__currentLoop;
			}

		},



		__block: function() {

			this.expect("{");

			var arr = [];
			while (is_token(this.__current, 'punc', '}') === false) {

				if (is_token(this.__current, 'EOF')) {
					this.__throwUnexpected();
				}

				arr.push(this.next());

			}

			this.next();

			return arr;

		},

		__break_continue: function(type) {

			type = typeof type === 'string' ? type : null;

			var name = null;
			if (this.__canInsertSemicolon() === false) {
				name = is_token(this.__current, 'name') ? this.__current.value : null;
			}


			if (name !== null) {

				this.next();

				if (is_member(name, this.__labels) === false) {
					this.__throw('Label ' + name + 'without matching loop or statement');
				}

			} else if (this.__currentLoop === 0) {
				this.__throw(type + ' not inside a loop or switch statement');
			}

			this.__semicolon();

			return this.as(type, name);

		},

		__for: function() {

			this.expect("(");

			var init = null;
			if (is_token(this.__current, 'punc', ';') === false) {

				// for (var x...)
				if (is_token(this.__current, 'keyword', 'var') === true) {
					this.next();
					init = this.__var(true);
				} else {
					init = this.__expression(true, true);
				}

				if (is_token(this.__current, 'operator', 'in') === true) {

					if (init[0] === 'var' && init[1].length > 1) {
						this.__throw('Only one variable declaration allowed in for...in loop');
					}

					return this.__for_in(init);

				}

				return this.__for_loop(init);

			}

		},

		__for_in: function(init) {
		},

		__for_loop: function(init) {

			this.expect(';');

			var test = is_token(this.__current, 'punc', ';') ? null : this.__expression();

			this.expect(';');

			var step = is_token(this.__current, 'punc', ')') ? null : this.__expression();

			this.expect(')');

			return this.as('for', init, test, loop, this.__inLoop(this.next));

		},

		__semicolon: function() {

			if (is_token(this.__current, 'punc', ';') === true) {
				this.next();
			} else if (this.__canInsertSemicolon() === false) {
				this.__throwUnexpected();
			}

		}

	};


	return Class;

});

