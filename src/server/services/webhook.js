'use strict';

// modules
var async = require('async');

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
        });
    },

    remove: function(args, done) {
        github.call({
            obj: 'repos',
            fun: 'getHooks',
            arg: {
                user: args.user,
                repo: args.repo,
                per_page: 100
            },
            token: args.token
        }, function(err, hooks) {
            if(err) {
                return done(err);
            }

            async.each(hooks, function(hook, callback) {
                if(hook.config.url !== url.webhook) {
                    return callback();
                }

                github.call({
                    obj: 'repos',
                    fun: 'deleteHook',
                    arg: {
                        user: args.user,
                        repo: args.repo,
                        id: hook.id
                    },
                    token: args.token
                }, callback);
            }, done);
        });
    }
};
