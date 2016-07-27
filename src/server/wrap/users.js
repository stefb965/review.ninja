'use strict';

// models
var User = require('mongoose').model('User');

module.exports = {

    get: function(req, githubUser, done) {
        User.findOne({ uuid: req.user.id }, function(err, user) {
            if(err) {
                return done(err, null);
            }

            githubUser.repos = user.repos || [];
            githubUser.prefs = user.prefs || {};
            githubUser.history = user.history || {};

            done(err, githubUser);
        });
    }
};
