
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



	var Class = function(source) {

		if (!source instanceof lychee.Tokenizer) {
			source = new lychee.Tokenizer(source, true);
		}


		this.__source = source;

		this.__previous = null;
		this.__current = null;
		this.__peeked = null;

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

			}

		},



		/*
		 * STATEMENTS
		 */
		__labeledStatement: function(label) {

			this.__labels.push(label);

			var start = this.__current,
				statement = this.statement();

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



		__block: function() {

			this.expect("{");

			var arr = [];
			while (is_token(this.__current, 'punc', '}') === false) {

				if (is_token(this.__current, 'EOF')) {
					this.__throwUnexpected();
				}

				arr.push(this.statement());

			}

			this.next();

			return arr;

		}

	};


	return Class;

});

