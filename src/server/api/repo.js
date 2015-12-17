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

            Repo.findOneAndUpdate({repo: req.args.repo_uuid}, req.args, {new: true, upsert: true}, done);
        });
    }
};
