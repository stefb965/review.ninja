'use strict';

var passport = require('passport');
var Strategy = require('passport-slack').Strategy;
var github = require('../services/github');
var Slack = require('mongoose').model('Slack');

if(config.server.slack.client) {
    passport.use(new Strategy({
            clientID: config.server.slack.client,
            clientSecret: config.server.slack.secret,
            scope: 'chat:write:bot',
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            github.call({
                obj: 'repos',
                fun: 'one',
                arg: { id: req.session.repo },
                token: req.user.token
            }, function(err, repo) {
                if(!err && repo.permissions.admin) {
                    Slack.findOneAndUpdate({repo: req.session.repo}, {token: accessToken}, {upsert: true}).exec();
                }

                done(null, {});
            });
        }
    ));
}
