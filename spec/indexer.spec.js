var Indexer = require('../src/indexer');

describe('Indexer', function () {
	var indexer;

	beforeEach(function () {
		indexer = new Indexer('myIndex');
	});

	afterEach(function () {
		indexer = null;
	});

	describe('appendToPosting', function () {
		it('it should append each term to the posting list', function () {
            indexer.appendToPosting(1, ['term1', 'term2']);
            expect(indexer.dictionary['term1']).toEqual([1])
        });
	});

	describe('flush', function () {
        it('writes the dictionary to disk in the format [term][n of posting ids][posting ids]', function () {
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
        });
	});
});