'use strict';

// modules
var _ = require('underscore');
// services
var github = require('../services/github');
var webhook = require('../services/webhook');
// models
var Repo = require('mongoose').model('Repo');

module.exports = {

    get: function(req, done) {
        Repo.findOne({repo: req.args.repo_uuid}, function(err, repo) {
            // check if settings exist and return them
            if(repo) {
                return done(err, repo);
            }

            // if they don't exist create them
            Repo.create({
                repo: req.args.repo_uuid
            }, done);
        });
    },

    set: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'one',
            arg: {id: req.args.repo_uuid},
            token: req.user.token
        }, function(err, repo) {
            if(err) {
                return done(err);
            }
            if(!repo.permissions.admin) {
                return done({
                    code: 403,
                    text: 'Forbidden'
                });
            }

            if(req.args.token) {
                req.args.token = req.user.token;
            }

            Repo.findOneAndUpdate({repo: req.args.repo_uuid}, req.args, {new: true}, done);
        });
    },

    token: function(req, done) {
        Repo.findOne({repo: req.args.repo_uuid}).select('+token').exec(function(err, repo) {

            if(err) {
                return done(err);
            }

            if(!repo || !repo.token) {
                return done(null, false);
            }

            github.call({
                obj: 'repos',
                fun: 'one',
                arg: {id: req.args.repo_uuid},
                token: repo.token
            }, function(err, githubRepo) {
                done(null, githubRepo && githubRepo.permissions.admin ? true : false);
            });
        });
    },

    webhook: function(req, done) {
        Repo.findOne({repo: req.args.repo_uuid}).select('+webhook').exec(function(err, repo) {

            if(err) {
                return done(err);
            }

            if(!repo || !repo.webhook) {
                return done(null, false);
            }

            github.call({
                obj: 'repos',
                fun: 'getHook',
                arg: {
                    user: req.args.user,
                    repo: req.args.repo,
                    id: repo.webhook
                },
                token: req.user.token
            }, function(err, hook) {

                if(hook && (!hook.active || _.difference(hook.events, config.server.github.webhook_events).length)) {
                    webhook.update({
                        user: req.args.user,
                        repo: req.args.repo,
                        webhook: repo.webhook,
                        token: req.user.token
                    });
                }

                done(null, hook ? true : false);
            });
        });
    }
};
