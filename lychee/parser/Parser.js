
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

		}

	};


	return Class;

});

