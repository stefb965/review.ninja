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
    var fakeStarComment4 = 'this is 👍';
    var fakeStarComment5 = 'this is ⭐';
    var fakeStarComment6 = 'this change lgtm';
    var fakeStarComment7 = 'this change just lpgtm';
    var fakeStarComment8 = 'looks good :shipit:';
    var trueResult1 = flags.star(fakeStarComment1);
    var trueResult2 = flags.star(fakeStarComment2);
    var trueResult3 = flags.star(fakeStarComment3);
    var trueResult4 = flags.star(fakeStarComment4);
    var trueResult5 = flags.star(fakeStarComment5);
    var trueResult6 = flags.star(fakeStarComment6);
    var trueResult7 = flags.star(fakeStarComment7);
    var trueResult8 = flags.star(fakeStarComment8);
    assert.equal(trueResult1, true);
    assert.equal(trueResult2, true);
    assert.equal(trueResult3, true);
    assert.equal(trueResult4, true);
    assert.equal(trueResult5, true);
    assert.equal(trueResult6, true);
    assert.equal(trueResult7, true);
    assert.equal(trueResult8, true);
    done();
  });

  it('should return false if no ninja star flag', function(done) {
    var fakeFalseComment1 = 'this has no flag';
    var fakeFalseComment2 = 'this is an !unstar';
    var fakeFalseComment3 = '👎👎👎';
    var falseResult1 = flags.star(fakeFalseComment1);
    var falseResult2 = flags.star(fakeFalseComment2);
    var falseResult3 = flags.star(fakeFalseComment3);
    assert.equal(falseResult1, false);
    assert.equal(falseResult2, false);
    assert.equal(falseResult3, false);
    done();
  });
});

describe('flags:unstar', function() {
  it('should return true if a conversation has an unstar flag', function(done) {
    var fakeUnstarComment1 = 'this is !unstar';
    var fakeUnstarComment2 = 'this is :thumbsdown:';
    var fakeUnstarComment3 = 'this is !star and !unstar';
    var fakeUnstarComment4 = 'this is :-1:';
    var fakeUnstarComment5 = 'this is 👎';
    var trueResult1 = flags.unstar(fakeUnstarComment1);
    var trueResult2 = flags.unstar(fakeUnstarComment2);
    var trueResult3 = flags.unstar(fakeUnstarComment3);
    var trueResult4 = flags.unstar(fakeUnstarComment4);
    var trueResult5 = flags.unstar(fakeUnstarComment5);
    assert.equal(trueResult1, true);
    assert.equal(trueResult2, true);
    assert.equal(trueResult3, true);
    assert.equal(trueResult4, true);
    assert.equal(trueResult5, true);
    done();
  });

  it('should return false if no unstar flag', function(done) {
    var fakeFalseComment1 = 'this has no flag';
    var fakeFalseComment2 = 'this is !star';
    var fakeFalseComment3 = '👍👍👍';
    var falseResult1 = flags.unstar(fakeFalseComment1);
    var falseResult2 = flags.unstar(fakeFalseComment2);
    var falseResult3 = flags.unstar(fakeFalseComment3);
    assert.equal(falseResult1, false);
    assert.equal(falseResult2, false);
    assert.equal(falseResult3, false);
    done();
  });
});
