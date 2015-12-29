'use strict';

// models
var User = require('mongoose').model('User');
var Action = require('mongoose').model('Action');

// services
var url = require('../services/url');
var flags = require('../services/flags');
var status = require('../services/status');
var notification = require('../services/notification');

module.exports = function(req, res) {

    var user = req.args.repository.owner.login;
    var repo = req.args.repository.name;
    var token = req.args.token;
    var number = req.args.pull_request.number;
    var sender = req.args.sender;
    var repo_uuid = req.args.repository.id;
    var sha = req.args.pull_request.head.sha;

    // for the thread
    var comment = req.args.comment;
    var comment_sha = req.args.comment.original_commit_id;
    var path = req.args.comment.path;
    var position = req.args.comment.original_position;

    var actions = {
        created: function() {
            status.update({
                sha: sha,
                user: user,
                repo: repo,
                number: number,
                repo_uuid: repo_uuid,
                token: token
            });

            var thread = flags.review([comment]);

            if(thread.open > 0) {
                notification.sendmail('review_thread_opened', user, repo, repo_uuid, token, number, {
                    user: user,
                    repo: repo,
                    number: number,
                    sender: req.args.sender,
                    settings: url.reviewSettings(user, repo),
                    url: url.reviewPullRequest(user, repo, number)
                });
            }
            else if(thread.closed > 0) {
                notification.sendmail('review_threads_closed', user, repo, repo_uuid, token, number, {
                    user: user,
                    repo: repo,
                    number: number,
                    sender: req.args.sender,
                    settings: url.reviewSettings(user, repo),
                    url: url.reviewPullRequest(user, repo, number)
                });
            }
        }
    };

    if (actions[req.args.action]) {
        actions[req.args.action]();
    }

    res.end();
};
