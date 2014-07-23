/**
* The indexer maintains an inverted index from terms
* to a list of posting ids.
*/

var Concentrate = require('concentrate');
var Dissolve = require('dissolve');
var fs = require('fs');

var Indexer = module.exports = function (filename) {
  this.dictionary = Object.create(null);
  this.blockNumber = 1;
  this.filename = filename;
  this.buffer = null;
};

/**
* Append each term to the posting list associated
* to the postingId.
*
* @method appendToPosting
* @param {Integer} The posting (document) id
* @param {Array} An array of string terms
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
*
* @param {String} filename The name of the file to write to.
*/

Indexer.prototype.flush = function () {
  var self = this;

  this.fillBlockBuffer();

  fs.appendFile(this.currentBlockName(), this.buffer.copy(), function (err) {
    if (err) throw err;
  });
  self.resetForNextBlock();
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
* Returns the file name were the index block is written
* when flush() is called.
*/

Indexer.prototype.currentBlockName = function () {
  return this.filename + '_' + this.blockNumber;
};

/**
* Increments the block number used in the filename
* of the index block written when flush() is called.
*/

Indexer.prototype._incrementBlockNumber = function () {
  this.blockNumber += 1;
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
* Creates and returns a buffer containing the term and posting ids
* in binary form.
*
* @param {String} term The term associated with the postingIds.
* @param {Array} postingIds An array of posting ids.
*/

Indexer.prototype._appendToBuffer = function (term, postingIds) {
  var self = this;

  if (this.buffer == null) this.buffer = Concentrate();

  this.buffer = this.buffer.string(padToLength20(term));
  this.buffer = this.buffer.uint32le(postingIds.length)
  postingIds.forEach(function (pid) {
    self.buffer = self.buffer.uint32le(pid);
  });
};

/**
* Returns a string that is always left padded to length 20 using spaces.
*
* @param {String} string The string to left pad.
*/

function padToLength20(str) {
  var len = 20;
  var arr = Array(len)
  for (var i = 0 ; i < arr.length ; i++) {
    arr[i] = ' ';
  }
  return String(arr.join('') + str).slice(-20);
}