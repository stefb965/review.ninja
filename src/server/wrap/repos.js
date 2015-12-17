'use strict';
// libraries
var async = require('async');

// models
var User = require('mongoose').model('User');
var Repo = require('mongoose').model('Repo');

// modules
var parse = require('parse-diff');
var minimatch = require('minimatch');

// services
var stats = require('../services/stats');
var github = require('../services/github');
var webhook = require('../services/webhook');

module.exports = {

    get: function(req, repo, done) {

        done(null, repo);

        // update the webhook
        if(repo.permissions.admin) {
            webhook.create({
                user: req.args.arg.user,
                repo: req.args.arg.repo,
                token: req.user.token
            });
        }

        // update the token
        if(repo.permissions.push) {
            Repo.findOneAndUpdate({repo: repo.id}, {token: req.user.token}, {upsert: true}).exec();
        }
    },

    compareCommits: function(req, comp, done) {
        comp.files.forEach(function(file) {
            try {
                file.patch = parse(file.patch);
            }
            catch(ex) {
                file.patch = null;
            }
        });

        github.call({
            obj: 'repos',
            fun: 'getContent',
            arg: {
                user: req.args.arg.user,
                repo: req.args.arg.repo,
                ref: req.args.arg.head,
                path: '.ninjaignore'
            },
            token: req.user.token
        }, function(err, file) {
            if(!err) {
                try {
                    var ninja = new Buffer(file.content, 'base64').toString('ascii');
                    ninja.split(/[\r\n]+/).forEach(function(ignore) {
                        if(ignore) {
                            comp.files.forEach(function(file) {
                                file.ignored = file.ignored || minimatch(file.filename, ignore, {dot: true, matchBase: true});
                            });
                        }
                    });
                } catch(err) {}
            }

            done(null, comp);
        });
    },

    getCollaborators: function(req, collaborators, done) {
        async.each(collaborators, function(collaborator, callback) {
            User.findOne({ uuid: collaborator.id }, function(err, user) {
                stats.statsForUserAndRepo(collaborator.id, req.args.arg.user, req.args.arg.repo, function(obj) {
                    collaborator.stats = obj;
                    collaborator.ninja = !!user;
                    callback(null);
                });
            });
        }, function() {
            done(null, collaborators);
        });
    }
};
