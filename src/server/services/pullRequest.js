'use strict';

var async = require('async');

var url = require('./url');
var flags = require('./flags');
var github = require('./github');

var Repo = require('mongoose').model('Repo');
var Star = require('mongoose').model('Star');


module.exports = {

    status: function(args, done) {

        Star.find({repo: args.repo_uuid, sha: args.sha}, function(err, stars) {

            stars = stars || [];

            async.filter(stars, function(star, call) {

                if(!args.reviewers) {
                    return call(true);
                }

                github.call({
                    obj: 'orgs',
                    fun: 'getTeamMember',
                    arg: {
                        id: args.reviewers,
                        user: star.name
                    },
                    token: args.token,
                    basicAuth: args.basicAuth
                }, function(err, member) {
                    call(member ? true : false);
                });
            }, function(stars) {

                github.call({
                    obj: 'pullRequests',
                    fun: 'getComments',
                    arg: {
                        user: args.user,
                        repo: args.repo,
                        number: args.number,
                        per_page: 100
                    },
                    token: args.token,
                    basicAuth: args.basicAuth
                }, function(err, comments) {

                    comments = comments || [];

                    done(null, {
                        stars: stars.length,
                        issues: flags.review(comments)
                    });
                });
            });
        });

    },

    badgeComment: function(user, repo, repo_uuid, number) {

        Repo.findOneAndUpdate({
            repo: repo_uuid
        }, {}, {
            new: true,
            upsert: true
        }, function(err, settings) {

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
