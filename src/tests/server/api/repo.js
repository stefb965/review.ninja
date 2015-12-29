'use strict';
// unit test
var assert = require('assert');
var sinon = require('sinon');

// config
global.config = require('../../../config');

// io
global.io = {emit: function() {}};

// models
var Repo = require('../../../server/documents/repo').Repo;
var Star = require('../../../server/documents/star').Star;

// services
var github = require('../../../server/services/github');
var status = require('../../../server/services/status');

// api
var repo = require('../../../server/api/repo');

describe('repo:get', function() {
    it('should find one repo', function(done) {
        var repoStub = sinon.stub(Repo, 'findOne', function(args, done) {
            assert.equal(args.repo, 'repo_uuid');
            done(null, {});
        });

        var calledOnceSpy = sinon.spy();
        var doneStub = function(err, repo) {
            calledOnceSpy();
        };
        var req = {
            args: {
                repo_uuid: 'repo_uuid'
            }
        };

        repo.get(req, doneStub);
        assert(calledOnceSpy.calledOnce);
        repoStub.restore();
        done();
    });

    it('should create repo if one is not there', function(done) {
        var repoStub = sinon.stub(Repo, 'findOne', function(args, done) {
            assert.equal(args.repo, 'repo_uuid');
            done(null, null);
        });

        var repoCreateStub = sinon.stub(Repo, 'create', function(args, done) {
            assert.equal(args.repo, 'repo_uuid');
        });

        var calledOnceSpy = sinon.spy();
        var doneStub = function(err, repo) {
            calledOnceSpy();
        };

        var req = {
            args: {
                repo_uuid: 'repo_uuid'
            }
        };

        repo.get(req, doneStub);
        repoStub.restore();
        repoCreateStub.restore();
        done();
    });
});


describe('repo:setComment', function() {
    it('should prevent setting the repo wide comments because of insufficent permissions', function(done) {
        var githubStub = sinon.stub(github, 'call', function(args, done) {
            assert.equal(args.obj, 'repos');
            assert.equal(args.fun, 'one');
            assert.equal(args.arg.id, 'repo_uuid');
            assert.equal(args.token, 'token');
            done(null, {
                permissions: {
                    admin: false
                }
            });
        });

        var req = {
            args: {
                repo_uuid: 'repo_uuid',
                comment: true
            },
            user: {
                token: 'token'
            }
        };

        var calledOnceSpy = sinon.spy();

        var doneStub = function(err, res) {
            assert.deepEqual(err, {
                code: 403,
                text: 'Forbidden'
            });
            calledOnceSpy();
        };

        repo.set(req, doneStub);
        assert(calledOnceSpy.calledOnce);
        githubStub.restore();
        done();
    });

    it('should set the comment if admin', function(done) {
        var githubStub = sinon.stub(github, 'call', function(args, done) {
            assert.equal(args.obj, 'repos');
            assert.equal(args.fun, 'one');
            assert.equal(args.arg.id, 'repo_uuid');
            assert.equal(args.token, 'token');
            done(null, {
                permissions: {
                    admin: true
                }
            });
        });

        var repoStub = sinon.stub(Repo, 'findOneAndUpdate', function(query, args, obj, done) {
            assert.equal(query.repo, 'repo_uuid');
            assert.equal(args.comment, true);
        });

        var req = {
            args: {
                repo_uuid: 'repo_uuid',
                comment: true
            },
            user: {
                token: 'token'
            }
        };

        var calledOnceSpy = sinon.spy();

        var doneStub = function(err, res) {
            calledOnceSpy();
        };

        repo.set(req, doneStub);
        githubStub.restore();
        repoStub.restore();
        done();
    });
});

// describe('repo:setThreshold', function() {
//     it('should prevent setting the threshold because of insufficent permissions', function(done) {
//         var githubStub = sinon.stub(github, 'call', function(args, done) {
//             assert.equal(args.obj, 'repos');
//             assert.equal(args.fun, 'one');
//             assert.equal(args.arg.id, 'repo_uuid');
//             assert.equal(args.token, 'token');
//             done(null, {
//                 permissions: {
//                     admin: false
//                 }
//             });
//         });

//         var req = {
//             args: {
//                 repo_uuid: 'repo_uuid'
//             },
//             user: {
//                 token: 'token'
//             }
//         };

//         var calledOnceSpy = sinon.spy();

//         var doneStub = function(err, res) {
//             assert.deepEqual(err, {
//                 msg: 'Insufficient permissions'
//             });
//             calledOnceSpy();
//         };

//         repo.setThreshold(req, doneStub);
//         assert(calledOnceSpy.calledOnce);
//         githubStub.restore();
//         done();
//     });

//     it('should set the threshold on a repo', function(done) {
//         var githubStub = sinon.stub(github, 'call', function(args, done) {
//             assert.equal(args.obj, 'repos');
//             assert.equal(args.fun, 'one');
//             assert.equal(args.arg.id, 'repo_uuid');
//             assert.equal(args.token, 'token');
//             done(null, {
//                 permissions: {
//                     admin: true
//                 }
//             });
//         });

//         var repoStub = sinon.stub(Repo, 'findOneAndUpdate', function(query, args, obj, done) {
//             assert.equal(query.repo, 'repo_uuid');
//             assert.equal(args.threshold, 2);
//         });

//         var req = {
//             args: {
//                 repo_uuid: 'repo_uuid',
//                 threshold: 2
//             },
//             user: {
//                 token: 'token'
//             }
//         };

//         var calledOnceSpy = sinon.spy();

//         var doneStub = function(err, res) {
//             calledOnceSpy();
//         };

//         repo.setThreshold(req, doneStub);
//         githubStub.restore();
//         repoStub.restore();
//         done();
//     });
// });
