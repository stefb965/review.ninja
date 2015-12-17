'use strict';

// models
var Star = require('mongoose').model('Star');
var Repo = require('mongoose').model('Repo');

// services
var github = require('../services/github');
var star = require('../services/star');

// helper functions
var exec = function(type, args, user, done) {

    github.call({
        obj: 'repos',
        fun: 'one',
        arg: {id: args.repo_uuid},
        token: user.token
    }, function(err, repo) {
        if(err) {
            return done(err, repo);
        }
        if(!repo.permissions.pull) {
            return done({
                code: 403,
                text: 'Forbidden'
            });
        }

        Repo.findOne({repo: repo.id}).select('+token').exec(function(err, repo) {
            var token = repo && repo.token ? repo.token : user.token;
            star[type](args.sha, args.user, args.repo, args.repo_uuid, args.number, user, token, done);
        });
    });
};

module.exports = {

    /************************************************************************************************************

    @models

    + Star, where repo=repo_uuid, sha=sha

    ************************************************************************************************************/

    all: function(req, done) {
        Star.find({sha: req.args.sha, repo: req.args.repo_uuid}, done);
    },


    /************************************************************************************************************

    @models

    + Star, where repo=repo_uuid, sha=sha, user=user_uuid

    ************************************************************************************************************/

    get: function(req, done) {
        Star.findOne({
            sha: req.args.sha,
            user: req.user.id,
            repo: req.args.repo_uuid
        }, done);
    },

    /************************************************************************************************************

    @models

    + Star

    ************************************************************************************************************/

    set: function(req, done) {

        exec('create', req.args, req.user, done);

    },

    /************************************************************************************************************

    @models

    + Star

    ************************************************************************************************************/

    rmv: function(req, done) {

        exec('remove', req.args, req.user, done);

    }
};
