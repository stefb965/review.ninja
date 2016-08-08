'use strict';
// modules
var fs = require('fs');
var ejs = require('ejs');

// services
var url = require('../services/url');
var mail = require('../services/mail');
var github = require('../services/github');

module.exports = {
    invite: function(req, done) {

        var template = fs.readFileSync('./src/server/templates/invite.ejs', 'utf-8');

        github.call({
            obj: 'users',
            fun: 'getForUser',
            arg: {user: req.args.invitee},
            token: req.user.token
        }, function(err, user) {
            if(err) {
                return done({ type: 'failed' });
            }

            if(!user.email && !req.args.email) {
                return done({ type: 'email' });
            }

            var to = user.email ? user.email : req.args.email;
            mail.send({
                from: config.server.smtp.from,
                to: to,
                subject: req.user.login + ' invited you to try ReviewNinja!',
                html: ejs.render(template, {
                    user: req.args.user,
                    repo: req.args.repo,
                    inviter: req.user.login,
                    url: url.reviewRepo(req.args.user, req.args.repo),
                    baseUrl: url.baseUrl
                })
            }, function(err, res) {
                err = err ? 'Invitation failed to send' : null;
                done(err, res);
            });
        });
    }
};
