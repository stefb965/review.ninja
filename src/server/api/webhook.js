'use strict';

// services
var github = require('../services/github');
var webhook = require('../services/webhook');

module.exports = {

    create: function(req, done) {
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

            webhook.create({
                user: repo.owner.login,
                repo: repo.name,
                repo_uuid: repo.id,
                token: req.user.token
            }, done);
        });
    },

    remove: function(req, done) {
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

            webhook.remove({
                user: repo.owner.login,
                repo: repo.name,
                repo_uuid: repo.id,
                token: req.user.token
            }, done);
        });
    }
};
