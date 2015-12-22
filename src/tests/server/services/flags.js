'use strict';

// unit test
var assert = require('assert');

// services
var flags = require('../../../server/services/flags');

// config
global.config = require('../../../config');

describe('flags:review', function() {
  it('should get the proper number of opened and closed issues', function(done) {
    var comments = [
      {body: 'flagged with !fix and !fixed', original_commit_id: 'test', path: 'file', original_position: 1},
      {body: 'flagged with !fixed', original_commit_id: 'test', path: 'file', original_position: 1},
      {body: 'flagged with !resolve', original_commit_id: 'test', path: 'file', original_position: 1},
      {body: 'flagged with !completed', original_commit_id: 'test', path: 'file', original_position: 1},
      {body: 'flagged with !fix', original_commit_id: 'test', path: 'file', original_position: 2},
      {body: 'flagged with !fix and !fixed', original_commit_id: 'test', path: 'file', original_position: 2},
      {body: 'not flagged', original_commit_id: 'test', path: 'file', original_position: 3}
    ];

    var result = flags.review(comments);
    assert.deepEqual(result, {open: 1, closed: 1, total: 2});
    done();
  });
});

describe('flags:star', function() {
  it('should return true if a conversation has a ninja star flag', function(done) {
    var fakeStarComment1 = 'this has a !star';
    var fakeStarComment2 = 'this is :+1:';
    var fakeStarComment3 = 'this is :thumbsup:';
    var trueResult1 = flags.star(fakeStarComment1);
    var trueResult2 = flags.star(fakeStarComment2);
    var trueResult3 = flags.star(fakeStarComment3);
    assert.equal(trueResult1, true);
    assert.equal(trueResult2, true);
    assert.equal(trueResult3, true);
    done();
  });

  it('should return false if no ninja star flag', function(done) {
    var fakeFalseComment1 = 'this has no flag';
    var fakeFalseComment2 = 'this is an !unstar';
    var falseResult1 = flags.star(fakeFalseComment1);
    var falseResult2 = flags.star(fakeFalseComment2);
    assert.equal(falseResult1, false);
    assert.equal(falseResult2, false);
    done();
  });
});

describe('flags:unstar', function() {
  it('should return true if a conversation has an unstar flag', function(done) {
    var fakeUnstarComment1 = 'this is !unstar';
    var fakeUnstarComment2 = 'this is :thumbsdown:';
    var fakeUnstarComment3 = 'this is !star and !unstar';
    var trueResult1 = flags.unstar(fakeUnstarComment1);
    var trueResult2 = flags.unstar(fakeUnstarComment2);
    var trueResult3 = flags.unstar(fakeUnstarComment3);
    assert.equal(trueResult1, true);
    assert.equal(trueResult2, true);
    assert.equal(trueResult3, true);
    done();
  });

  it('should return false if no unstar flag', function(done) {
    var fakeFalseComment1 = 'this has no flag';
    var fakeFalseComment2 = 'this is !star';
    var falseResult1 = flags.unstar(fakeFalseComment1);
    var falseResult2 = flags.unstar(fakeFalseComment2);
    assert.equal(falseResult1, false);
    assert.equal(falseResult2, false);
    done();
  });
});
