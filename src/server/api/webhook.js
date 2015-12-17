'use strict';

// services
var github = require('../services/github');
var webhook = require('../services/webhook');

module.exports = {
    create: function(req, done) {
        webhook.create({
            user: req.args.user,
            repo: req.args.repo,
            token: req.user.token
        }, done);
    },

    remove: function(req, done) {
        webhook.remove({
            user: req.args.user,
            repo: req.args.repo,
            token: req.user.token
        }, done);
    }
};
