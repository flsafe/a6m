var Tokenizer = require('../src/tokenizer');

describe('Tokenizer', function() {
	var tokenizer;

	beforeEach(function() {
		tokenizer = new Tokenizer();
	});

	afterEach(function() {
		tokenizer = null;
	});

	describe('toTokens', function() {
		it('splits on white space', function(){
			var tokens = tokenizer.toTokens('Austin Pizza LLC');
			expect(tokens.sort()).toEqual(['austin', 'llc', 'pizza'].sort());
		});

		it('returns lowercase tokens', function() {
			var tokens = tokenizer.toTokens('AAA');
			expect(tokens).toEqual(['aaa']);
		});

		it('trims punctuation at the start and end of each token', function() {
			var tokens = tokenizer.toTokens('!hello! !world!');
			expect(tokens.sort()).toEqual(['hello', 'world']);
		});

		it('does not return tokens consisting of only non-apha numerics', function() {
			var tokens = tokenizer.toTokens('!!! token');
			expect(tokens.sort()).toEqual(['token'])
		});

		it('normalizes web urls', function() {
			var tokens = tokenizer.toTokens('http://www.google.com/');
			expect(tokens).toEqual(['google.com']);
		});

		it('normalizes phone numbers', function() {
			var tokens = tokenizer.toTokens('(915)920-0102');
			expect(tokens).toContain('9159200102');
			expect(tokens).toContain('915');
		});
	});
});