'use strict';

var http = require('http');
var https = require('https');

var url = require('./url');
var github = require('./github');
var Star = require('mongoose').model('Star');
var Repo = require('mongoose').model('Repo');
var Slack = require('mongoose').model('Slack');

module.exports = {
    notify: function(event, args) {

        if(config.server.slack.host) {

            Repo.findOne({repo: args.repo_uuid}, function(err, repo) {

                repo = repo || {threshold: 1};

                Slack.findOne({repo: args.repo_uuid}).select('+token').exec(function(err, slack) {

                    var type = event !== 'unstar' ? event : 'star';

                    if(!err && slack && slack.token && slack.events[type]) {
                        github.call({
                            obj: 'pullRequests',
                            fun: 'get',
                            arg: {
                                user: args.user,
                                repo: args.repo,
                                number: args.number
                            },
                            token: args.token
                        }, function(err, pull) {
                            if(!err) {
                                Star.count({repo: args.repo_uuid, sha: args.sha, reviewer: {$ne: false}}, function(err, count) {
                                    if(!err) {

                                        // add our data
                                        pull.stars = count;
                                        pull.threshold = repo.threshold;

                                        var req = (config.server.slack.port === '443' ? https : http).request({
                                            host: config.server.slack.host,
                                            port: config.server.slack.port,
                                            path: config.server.slack.path,
                                            method: 'POST',
                                            headers: {'Content-Type': 'application/json'}
                                        });

                                        var data = {
                                            event: event,
                                            token: slack.token,
                                            channel: slack.channel,
                                            sender: args.sender,
                                            pull_request: pull,
                                            url: url.reviewPullRequest(args.user, args.repo, args.number)
                                        };

                                        req.write(JSON.stringify(data));
                                        req.end();
                                    }
                                });


                            }
                        });
                    }
                });
            });
        }
    }
};
