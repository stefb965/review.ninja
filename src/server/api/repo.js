'use strict';

var extend = require('extend');

// services
var github = require('../services/github');
var status = require('../services/status');
// models
var Repo = require('mongoose').model('Repo');
var merge = require('merge');

module.exports = {

    get: function(req, done) {
        Repo.findOne({repo: req.args.repo_uuid}, function(err, repo) {
            if(err || repo) {
                return done(err, repo);
            }

            Repo.create({
                repo: req.args.repo_uuid
            }, done);
        });
    },

    setComment: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'one',
            arg: { id: req.args.repo_uuid },
            token: req.user.token
        }, function(err, repo) {
            if(err) {
                return done(err);
            }
            if(!repo.permissions.admin) {
                return done({msg: 'Insufficient permissions'});
            }
            Repo.findOneAndUpdate({
                repo: req.args.repo_uuid
            }, {
                comment: req.args.comment
            }, {new: true}, done);
        });
    },

    setThreshold: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'one',
            arg: { id: req.args.repo_uuid },
            token: req.user.token
        }, function(err, repo) {
            if(err) {
                return done(err);
            }

            if(!repo.permissions.admin) {
                return done({msg: 'Insufficient permissions'});
            }
            Repo.findOneAndUpdate({
                repo: req.args.repo_uuid
            }, {
                threshold: req.args.threshold
            }, {new: true}, function(err, repo) {
                done(err, repo);
                github.call({
                    obj: 'pullRequests',
                    fun: 'getAll',
                    arg: {
                        user: req.args.user,
                        repo: req.args.repo
                    },
                    token: req.user.token
                }, function(err, pulls) {
                    if (!err) {
                        pulls.forEach(function(pull) {
                            status.update({
                                user: req.args.user,
                                repo: req.args.repo,
                                sha: pull.head.sha,
                                repo_uuid: req.args.repo_uuid,
                                number: pull.number,
                                token: req.user.token
                            });
                        });
                    }
                });
            });
        });
    },

    setSlack: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'one',
            arg: { id: req.args.repo_uuid },
            token: req.user.token
        }, function(err, repo) {
            if(err) {
                return done(err);
            }
            if(!repo.permissions.admin) {
                return done({msg: 'Insufficient permissions'});
            }

            if(req.args.slack && req.args.slack.channel && req.args.slack.channel.charAt(0) !== '#') {
                req.args.slack.channel = '#' + req.args.slack.channel;
            }

            Repo.findOne({repo: req.args.repo_uuid}).select('+slack.token').exec(function(err, repo) {

                if(err || !repo) {
                    return done(err, repo);
                }

                extend(repo.slack, req.args.slack);

                repo.save(function(err, repo) {
                    if(!err) {
                        repo.slack.token = !!repo.slack.token;
                    }
                    done(err, repo);
                });
            });
        });
    },

    getSlack: function(req, done) {
        Repo.findOneAndUpdate({
            repo: req.args.repo_uuid
        }, {}, {new: true, upsert: true}).select('+slack.token').exec(function(err, repo) {
            if(err) {
                return done(err);
            }
            repo.slack.token = !!repo.slack.token;
            done(err, repo.slack);
        });
    },

    setReviewers: function(req, done) {
      github.call({
          obj: 'repos',
          fun: 'one',
          arg: { id: req.args.repo_uuid },
          token: req.user.token
      }, function(err, repo) {
          if(err) {
              return done(err);
          }

          if(!repo.permissions.admin) {
              return done({msg: 'Insufficient permissions'});
          }
          Repo.findOneAndUpdate({
              repo: req.args.repo_uuid
          }, {
              reviewers: req.args.reviewers
          }, {new: true}, function(err, repo) {
              done(err, repo);
          });
      });
    }

};
