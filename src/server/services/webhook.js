'use strict';

// services
var url = require('./url');
var github = require('./github');

// models
var Repo = require('mongoose').model('Repo');

module.exports = {
    create: function(args, done) {
        github.call({
            obj: 'repos',
            fun: 'createHook',
            arg: {
                user: args.user,
                repo: args.repo,
                name: 'web',
                config: {url: url.webhook, content_type: 'json'},
                events: config.server.github.webhook_events,
                active: true
            },
            token: args.token
        }, function(err, hook) {
            var webhook = hook ? hook.id : undefined;
            Repo.findOne({repo: args.repo_uuid}, function(err, repo) {
                if(!repo) {
                    return Repo.create({
                        repo: args.repo_uuid,
                        webhook: webhook,
                        token: args.token
                    }, done);
                }

                Repo.findOneAndUpdate({repo: args.repo_uuid}, {webhook: webhook}, done);
            });
        });
    },

    update: function(args, done) {
        github.call({
            obj: 'repos',
            fun: 'updateHook',
            arg: {
                user: args.user,
                repo: args.repo,
                id: args.webhook,
                name: 'web',
                config: {url: url.webhook, content_type: 'json'},
                events: config.server.github.webhook_events,
                active: true
            },
            token: args.token
        }, done);
    },

    remove: function(args, done) {
        Repo.findOne({repo: args.repo_uuid}, function(err, repo) {
            if(!repo) {
                return done(err, repo);
            }

            github.call({
                obj: 'repos',
                fun: 'deleteHook',
                arg: {
                    user: args.user,
                    repo: args.repo,
                    id: repo.webhook
                },
                token: args.token
            }, function(err, hook) {
                if(err) {
                    return done(err, repo);
                }

                repo.webhook = null;
                repo.save(done);
            });
        });
    }
};
