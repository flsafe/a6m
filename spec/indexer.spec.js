var Indexer = require('../src/indexer');
var fs = require('fs');

describe('Indexer', function () {
	var indexer;
    var indexFile = 'index/test_index';

	beforeEach(function () {
		indexer = new Indexer(indexFile);
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
        afterEach(function () {
            fs.unlink(indexFile);
        });

        it('writes the dictionary to disk in the format [term][n of posting ids][posting ids]', function () {
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
            waitsFor(function () {
                return indexer.buffer === null;
            });
            runs(function () {
                expect(fs.existsSync(indexFile)).toBe(true);
            })
        });
	});
});