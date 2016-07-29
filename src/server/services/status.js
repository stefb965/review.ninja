'use strict';

var url = require('./url');
var github = require('./github');
var pullRequest = require('./pullRequest');

var Repo = require('mongoose').model('Repo');

module.exports = {

    update: function(args) {

        Repo.findOne({repo: args.repo_uuid}, function(err, repo) {

            repo = repo || {threshold: 1};

            pullRequest.status({
                sha: args.sha,
                user: args.user,
                repo: args.repo,
                number: args.number,
                repo_uuid: args.repo_uuid,
                token: args.token
            }, function(err, status) {

                var state = status.issues.open ? 'failure' : status.stars >= repo.threshold ? 'success' : 'pending';

                var description = status.stars + ' (of ' + repo.threshold + ') ninja stars';

                if(status.issues.total > 0) {
                    description += ', ' + status.issues.closed + ' (of ' + status.issues.total + ') problems resolved';
                }

                github.call({
                    obj: 'repos',
                    fun: 'createStatus',
                    arg: {
                        user: args.user,
                        repo: args.repo,
                        sha: args.sha,
                        state: state,
                        description: description,
                        target_url: url.reviewPullRequest(args.user, args.repo, args.number),
                        context: 'code-review/reviewninja'
                    },
                    token: args.token
                });
            });
        });
    }
};
