'use strict';

// services
var github = require('../services/github');
// models
var Slack = require('mongoose').model('Slack');

module.exports = {

    get: function(req, done) {
        Slack.findOne({repo: req.args.repo_uuid}, function(err, slack) {
            // check if slack settings exist and return them
            if(slack) {
                return done(err, slack);
            }

            // if they don't exist create them
            Slack.create({
                repo: req.args.repo_uuid
            }, done);
        });
    },

    set: function(req, done) {
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
                return done({
                    code: 403,
                    text: 'Forbidden'
                });
            }

            if(req.args.channel && req.args.channel.charAt(0) !== '#') {
                req.args.channel = '#' + req.args.channel;
            }

            Slack.findOneAndUpdate({repo: req.args.repo_uuid}, req.args, {new: true, upsert: true}, done);
        });
    },

    token: function(req, done) {
        Slack.findOne({repo: req.args.repo_uuid}).select('+token').exec(function(err, slack) {
            done(err, slack && slack.token ? true : false);
        });
    }
};
