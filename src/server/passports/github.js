'use strict';

var url = require('../services/url');
var passport = require('passport');
var Strategy = require('passport-github').Strategy;
var merge = require('merge');

passport.use(new Strategy({
        clientID: config.server.github.client,
        clientSecret: config.server.github.secret,
        authorizationURL: url.githubAuthorization,
        tokenURL: url.githubToken,
        userProfileURL: url.githubProfile()
    },
    function(accessToken, refreshToken, profile, done) {
        models.User.update({
            uuid: profile.id
        }, {
            name: profile.username,
            token: accessToken
        }, {
            upsert: true
        }, function(err, num, res) {
            done(null, merge(profile._json, {
                token: accessToken
            }));
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
