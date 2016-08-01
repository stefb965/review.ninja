'use strict';

// modules
var http = require('http');
var https = require('https');

// services
var url = require('../services/url');
var github = require('../services/github');
var webhook = require('../services/webhook');

// models
var User = require('mongoose').model('User');
var Repo = require('mongoose').model('Repo');

module.exports = {

    authorization: function(req, done) {
        github.call({
            obj: 'authorization',
            fun: 'check',
            arg: {
                access_token: req.user.token,
                client_id: config.server.github.client
            },
            basicAuth: {
                user: config.server.github.client,
                pass: config.server.github.secret
            }
        }, function(err, auth) {

            var res = !err ? {
                id: auth.id,
                html_url: url.githubBase + '/settings/connections/' + auth.id
            } : null;

            done(err, res);
        });
    },

    addRepo: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'one',
            arg: { id: req.args.repo_uuid },
            token: req.user.token
        }, function(err, repo) {
            if(err) {
                return done(err);
            }
            if(!repo.permissions.push) {
                return done({
                    code: 403,
                    text: 'Forbidden'
                });
            }

            User.findOne({ uuid: req.user.id }, function(err, user) {
                if(user) {
                    var found = false;
                    user.repos.forEach(function(repo) {
                        if(repo === req.args.repo_uuid) {
                            found = true;
                        }
                    });

                    if(!found) {
                        user.repos.push(req.args.repo_uuid);
                        user.save();
                    }

                    if(repo.permissions.admin) {
                        webhook.create({
                            user: repo.owner.login,
                            repo: repo.name,
                            token: req.user.token
                        });
                    }

                    if(repo.permissions.push) {
                        Repo.findOneAndUpdate({repo: repo.id}, {token: req.user.token}, {upsert: true}).exec();
                    }
                }

                done(err, {repos: user ? user.repos : null});
            });
        });

    },

    rmvRepo: function(req, done) {

        // remove from user array
        User.findOne({ uuid: req.user.id }, function(err, user) {
            if(user) {
                var repos = [];
                user.repos.forEach(function(repo) {
                    if(repo !== req.args.repo_uuid) {
                        repos.push(repo);
                    }
                });

                user.repos = repos;
                user.save();
            }

            done(err, {repos: user ? user.repos : null});
        });
    },

    dismiss: function(req, done) {
        User.findOne({ uuid: req.user.id }, function(err, user) {
            if(user) {
                var history = {};
                for(var h in user.history) {
                    history[h] = user.history[h];
                }

                history[req.args.key] = req.args.val || true;
                user.history = history;

                user.save();
            }
            done(err, {history: user ? user.history : null});
        });
    },

    setPref: function(req, done) {
        User.findOne({ uuid: req.user.id }, function(err, user) {
            if(user) {
                var prefs = {};
                for(var p in user.prefs) {
                    prefs[p] = user.prefs[p];
                }

                prefs[req.args.key] = req.args.val;
                user.prefs = prefs;

                user.save();
            }

            done(err, {prefs: user ? user.prefs : null});
        });
    }
};
