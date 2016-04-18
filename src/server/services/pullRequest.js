'use strict';

var async = require('async');

var url = require('./url');
var flags = require('./flags');
var github = require('./github');

var Repo = require('mongoose').model('Repo');
var Star = require('mongoose').model('Star');


module.exports = {

    status: function(args, done) {

        // About the "reviewer" flag:
        //
        // null   | if no review team has been specified (default)
        // true   | if user is on the review team
        // false  | if user is not on the review team

        Star.count({repo: args.repo_uuid, sha: args.sha, reviewer: {$ne: false}}, function(err, stars) {
            var rArgs = {
                user: args.user,
                repo: args.repo,
                number: args.number,
                per_page: 100
            };

            async.parallel([
              function(cb) {
                github.call({
                    obj: 'pullRequests',
                    fun: 'getComments',
                    arg: rArgs,
                    token: args.token
                }, function(err, results) {
                  cb(results);
                });
              }, function(cb) {
                github.call({
                    obj: 'issues',
                    fun: 'getComments',
                    arg: rArgs,
                    token: args.token
                }, function(err, results) {
                  cb(results);
                });
              }
            ], function(comments) {
              done(null, {
                  stars: stars || 0,
                  issues: flags.review(comments || [])
              });
            });
        });
    },

    badgeComment: function(user, repo, repo_uuid, number) {

        Repo.findOne({repo: repo_uuid}, function(err, settings) {

            settings = settings || {comment: true};

            if(!err && settings && settings.comment && config.server.github.user) {

                var badgeUrl = url.pullRequestBadge(repo_uuid, number);
                var pullUrl = url.reviewPullRequest(user, repo, number);

                var badgelink = '<a href="' + pullUrl + '" target="_blank"><img src="' + badgeUrl + '" alt="ReviewNinja"/>';

                github.call({
                    obj: 'issues',
                    fun: 'createComment',
                    arg: {
                        user: user,
                        repo: repo,
                        number: number,
                        body: badgelink
                    },
                    basicAuth: {
                        user: config.server.github.user,
                        pass: config.server.github.pass
                    }
                });
            }
        });
    },

    isWatched: function(pull, settings) {

        // by default we are watching all branches
        var watched = !settings.watched.length;

        settings.watched.forEach(function(watch) {
            // escape all regex symbols except '*'
            var watchRegex = watch.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
            // replace '*' with regex anything until next symbol (.*?)
            watchRegex = watchRegex.replace(/[*]/g, '(.*?)');
            var re = RegExp(watchRegex, 'g');
            if(re.exec(pull.base.ref) || re.exec(pull.head.ref)) {
                watched = true;
            }
        });
        return watched;
    }
};
