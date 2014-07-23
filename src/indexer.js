/**
* The indexer maintains an inverted index from terms
* to a list of posting ids.
*/

var Concentrate = require('concentrate');
var Dissolve = require('dissolve');
var fs = require('fs');

var Indexer = module.exports = function (filename) {
  this.dictionary = Object.create(null);
  this.filename = filename;
  this.buffer = Concentrate();
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
* Writes the current dictionary to disk in the following format:
*
* [term][number of posting ids][posting ids][term2]...
*
* The terms and posting ids are written in ascending order.
*
* @param {String} filename The name of the file to write to.
*/

Indexer.prototype.flush = function () {
  var self = this;

  var terms = Object.keys(this.dictionary).sort();
  terms.forEach(function (term) {
    var postIds = self.dictionary[term].sort(function (a,b) {return a-b;});
    self._appendToBuffer(term, postIds);
  });
  console.log(this.buffer.result());
  this.buffer = Object.create(null);
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

  this.buffer = this.buffer.string(padToLength20(term));
  this.buffer = this.buffer.uint32le(postingIds.length)
  postingIds.forEach(function (pid) {
    self.buffer = self.buffer.uint32le(pid);
  });
};

function padToLength20(str) {
  var len = 20;
  var arr = Array(len)
  for (var i = 0 ; i < arr.length ; i++) {
    arr[i] = ' ';
  }
  return String(arr.join('') + str).slice(-20);
}