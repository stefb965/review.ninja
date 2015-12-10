'use strict';

var url = require('./url');
var github = require('./github');
var pullRequest = require('./pullRequest');

var Repo = require('mongoose').model('Repo');

module.exports = {

    update: function(args) {

        Repo.findOneAndUpdate({
            repo: args.repo_uuid
        }, {}, {
            new: true,
            upsert: true
        }, function(err, repo) {

            repo = repo || {threshold: 1, reviewers: null};

            pullRequest.status({
                sha: args.sha,
                user: args.user,
                repo: args.repo,
                number: args.number,
                threshold: repo.threshold,
                reviewers: repo.reviewers,
                repo_uuid: args.repo_uuid,
                token: args.token
            }, function(err, status) {

                var reached = status.stars >= repo.threshold;
                var state = status.issues.open ? 'failure' : reached ? 'success' : 'pending';
                var diff = repo.threshold - status.stars;

                var text = 'ReviewNinja: ';
                text = text + (reached ? status.stars + (status.stars === 1 ? ' star, ' : ' stars, ')
                                       : diff + (diff === 1 ? ' star' : ' stars') + ' needed, ');
                text = text + status.issues.open;
                text = text + (status.issues.open === 1 ? ' issue' : ' issues');

                github.call({
                    obj: 'statuses',
                    fun: 'create',
                    arg: {
                        user: args.user,
                        repo: args.repo,
                        sha: args.sha,
                        state: state,
                        description: text,
                        target_url: url.reviewPullRequest(args.user, args.repo, args.number),
                        context: 'code-review/reviewninja'
                    },
                    token: args.token
                });
            });
        });
    }
};
