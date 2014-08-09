/**
* The indexer maintains an inverted index from terms
* to a list of posting ids.
*/

var Concentrate = require('concentrate');
var Dissolve = require('dissolve');

var fs = require('fs');

var _ = require('underscore');
var Q = require('q');

var Indexer = module.exports = function (filename) {
  this.dictionary = Object.create(null);
  this.blockNumber = 1;
  this.filename = filename;
  this.buffer = null;
  this.fds = null;
};

/**
* Append each term to the posting list associated
* to the postingId.
*
* @method appendToPosting
* @param {Number} postingId The posting (document) id.
* @param {Array} terms An array of string terms.
*/

Indexer.prototype.appendToPosting = function (postingId, terms) {
  var self = this;
  terms.forEach(function (term) {
    if (self.dictionary[term] === undefined) {
      self.dictionary[term] = [postingId];
    } else {
      self.dictionary[term].push(postingId);
    }
  });
};

/**
* Writes the current dictionary to disk.
* Each call to flush writes what is considered one block of the entire index.
* After each call to flush() the indexer will be reset to accept appending to a
* new block.
*/

Indexer.prototype.flush = function () {
  var self = this;

  this.fillBlockBuffer();

  fs.appendFile(this.toBlockName(this.blockNumber), this.buffer.copy(), function (err) {
    if (err) throw err;
  });
  self.resetForNextBlock();
};

/**
 * Merges the index blocks into one index file.
 */

Indexer.prototype.merge = function () {
  var self = this;
};

/**
* Fills the binary block buffer in the following format:
* [term][number of posting ids][posting ids][term2]...
* The terms and posting ids in each block are written in ascending order.
*/

Indexer.prototype.fillBlockBuffer = function () {
  var self = this;

  var terms = Object.keys(this.dictionary).sort();
  terms.forEach(function (term) {
    var postIds = self.dictionary[term].sort(function (a,b) {return a-b;});
    self._appendToBuffer(term, postIds);
  });
}

/**
* Returns the file name of the index block created
* when flush() is called.
*
* @param {Number} i The block number to use in the block filename.
*/

Indexer.prototype.toBlockName = function (i) {
  return this.filename + '_' + i;
};

/**
* Reset the indexer to prepare for appending to a new block.
*/

Indexer.prototype.resetForNextBlock = function () {
  this.buffer = null;
  this.dictionary = Object.create(null);
  this._incrementBlockNumber();
};

/**
 * Returns the file descriptors for each block.
 */

Indexer.prototype.openBlockFiles = function (cb) {
  return this._openFiles(this.getBlockNames(), cb);
};

/**
 * Returns the block file names.
 */

Indexer.prototype.getBlockNames = function () {
  var self = this;

 return _.chain(_.range(1, this.blockNumber))
         .map(function (i) {return self.toBlockName(i)})
         .value();
};

/**
 * Opens and returns the file descriptors for each given file name.
 * The file descriptors are returned via the callback function.
 *
 * @param {Array} fileNames An array of file names
 * to return the file descriptors for.

 * @param {Function} cb Called with an array containing open file descriptors
 * or an error object if there is an error in opening the files.
 */

Indexer.prototype._openFiles = function (fileNames, cb) {
  var self = this;

  var openProms = _.chain(fileNames)
                  .map(function (name) {
                    var defered = Q.defer();
                    fs.open(name, 'r', function (err, fd) {
                                        if (err) {
                                          defered.reject(err);
                                        } else {
                                          defered.resolve(fd) ;
                                        }
                                      });
                    return defered.promise;
                  })
                  .value();

  Q.all(openProms)
   .then(function (results) { self.fds = results ; cb(null, results) })
   .fail(function (err) { cb(err, []) })
   .done();
};

/**
* Increments the block number used in index block file name
* when flush() is called.
*/

Indexer.prototype._incrementBlockNumber = function () {
  this.blockNumber += 1;
};

/**
* Creates and returns a binary buffer containing the term and posting ids.
*
* @param {String} term The term associated with the postingIds.
* @param {Array} postingIds An array of posting ids.
*/

Indexer.prototype._appendToBuffer = function (term, postingIds) {
  var self = this;

  if (this.buffer == null) this.buffer = Concentrate();

  this.buffer = this.buffer.string(padToLength20(term));
  this.buffer = this.buffer.uint32le(postingIds.length);
  postingIds.forEach(function (pid) {
    self.buffer = self.buffer.uint32le(pid);
  });
};

/**
* Returns a string that is always length 20. Left padded using spaces.
*
* @param {String} str The string to left pad.
*/

function padToLength20(str) {
  var len = 20;
  var arr = new Array(len);
  for (var i = 0 ; i < arr.length ; i++) {
    arr[i] = ' ';
  }
  return String(arr.join('') + str).slice(-20);
}