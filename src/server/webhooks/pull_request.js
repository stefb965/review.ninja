'use strict';

//services
var url = require('../services/url');
var slack = require('../services/slack');
var github = require('../services/github');
var status = require('../services/status');
var pullRequest = require('../services/pullRequest');
var notification = require('../services/notification');

//////////////////////////////////////////////////////////////////////////////////////////////
// Github Pull Request Webhook Handler
//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(req, res) {

    var user = req.args.repository.owner.login;
    var repo = req.args.repository.name;
    var token = req.args.token;
    var number = req.args.number;
    var sender = req.args.sender;
    var repo_uuid = req.args.repository.id;
    var sha = req.args.pull_request.head.sha;

    var actions = {
        opened: function() {
            status.update({
                sha: sha,
                user: user,
                repo: repo,
                number: number,
                repo_uuid: repo_uuid,
                token: token
            });

            notification.sendmail('pull_request_opened', user, repo, repo_uuid, token, number, {
                user: user,
                repo: repo,
                number: number,
                sender: sender,
                settings: url.reviewSettings(user, repo),
                url: url.reviewPullRequest(user, repo, number)
            });

            pullRequest.badgeComment(user, repo, repo_uuid, number);

            slack.notify('pull_request', {
                sha: sha,
                user: user,
                repo: repo,
                number: number,
                sender: sender,
                repo_uuid: repo_uuid,
                token: token
            });
        },
        synchronize: function() {
            status.update({
                sha: sha,
                user: user,
                repo: repo,
                number: number,
                repo_uuid: repo_uuid,
                token: token
            });

            notification.sendmail('pull_request_synchronized', user, repo, repo_uuid, token, number, {
                user: user,
                repo: repo,
                number: number,
                sender: sender,
                settings: url.reviewSettings(user, repo),
                url: url.reviewPullRequest(user, repo, number)
            });
        },
        closed: function() {
            if(req.args.pull_request.merged) {
                slack.notify('merge', {
                    sha: sha,
                    user: user,
                    repo: repo,
                    number: number,
                    sender: sender,
                    repo_uuid: repo_uuid,
                    token: token
                });
            }
        },
        reopened: function() {
            // a pull request you have reviewed has a been reopened
            // send messages to responsible users?
        }
    };

    if (actions[req.args.action]) {
        actions[req.args.action]();
    }

    res.end();
};
