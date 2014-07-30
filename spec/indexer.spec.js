var Indexer = require('../src/indexer');
var fs = require('fs');
var _ = require('underscore');

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
            _.each(indexer.getBlockNames, function (bname) {fs.unlink(bname)})

        });

        it('writes the dictionary to disk with the block number in the filename', function () {
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
            waitsFor(function () {
                return indexer.buffer === null;
            });
            runs(function () {
                expect(fs.existsSync(indexFile + '_1')).toBe(true);
                expect(fs.existsSync(indexFile + '_2')).toBe(true);
            })
        });

        it('empties the write buffer, resets the dictionary, increments the block number', function() {
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
            waitsFor(function () {
                return indexer.buffer == null;
            });
            runs(function () {
                expect(indexer.buffer).toEqual(null);
                expect(Object.keys(indexer.dictionary).length).toEqual(0);
                expect(indexer.blockNumber).toEqual(2);
            });
        });

        it('writes it in the [term][n postingIds][postingIds] format', function (){
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
            waitsFor(function () {
                return indexer.buffer == null;
            });
            runs(function () {
                expect(fs.existsSync(indexFile + '_1')).toBe(true);
            })
        });
	});

    describe('merge', function () {
        it('merges all the index block files into one index file', function () {
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
            indexer.appendToPosting(2, ['b']);
            indexer.merge();
            // Expect one merged file, such that when loaded is an object:
            // {'a': [1], 'b': [2]}
        }) ;
    });


    describe('openBlockFiles', function () {
        afterEach(function () {
            for (var i = 1 ; i < indexer.blockNumber ; i++) {
                fs.unlink(indexFile + '_' + i);
            }
        });

        it('returns the filenames of all the blocks that were written', function () {
            indexer.appendToPosting(1, ['a']);
            indexer.flush();
            indexer.appendToPosting(2, ['b']);
            indexer.flush();

            var fds;
            indexer.openBlockFiles(function(r) { fds = r });

            waitsFor(function () {
                return fds && fds !== null;
            });
            runs(function  () {
                expect(indexer.fds.length).toBeGreaterThan(0);
            });
        }) ;
    });
});