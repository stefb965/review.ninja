'use strict';

var passport = require('passport');
var Strategy = require('passport-slack').Strategy;

if(config.server.slack.client) {
    passport.use(new Strategy({
            clientID: config.server.slack.client,
            clientSecret: config.server.slack.secret,
            scope: 'incoming-webhook'
        },
        function(accessToken, refreshToken, profile, done) {
            // do something
            done(null, {});
        }
    ));
}
