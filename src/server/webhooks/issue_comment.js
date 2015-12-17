'use strict';

// models
var Star = require('mongoose').model('Star');
var User = require('mongoose').model('User');

// services
var star = require('../services/star');
var flags = require('../services/flags');
var github = require('../services/github');
var status = require('../services/status');
var notification = require('../services/notification');

//////////////////////////////////////////////////////////////////////////////////////////////
// Github Issue comment Webhook Handler
//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(req, res) {

    var user = req.args.repository.owner.login;
    var repo = req.args.repository.name;
    var token = req.args.token;
    var number = req.args.issue.number;
    var sender = req.args.sender;
    var comment = req.args.comment.body;
    var repo_uuid = req.args.repository.id;

    var actions = {
        created: function() {

            //
            // Add ninja star
            //

            var func = flags.unstar(comment) ? 'remove' : flags.star(comment) ? 'create' : null;

            if(func) {
                github.call({
                    obj: 'pullRequests',
                    fun: 'get',
                    arg: {
                        user: user,
                        repo: repo,
                        number: number
                    },
                    token: token
                }, function(err, pull) {
                    if(!err) {
                        User.findOne({uuid: sender.id}, function(err, ninja) {
                            sender.token = ninja && ninja.token ? ninja.token : null;
                            star[func](pull.head.sha, user, repo, repo_uuid, number, sender, token);
                        });
                    }
                });
            }
        }
    };

    if (actions[req.args.action]) {
        actions[req.args.action]();
    }

    res.end();
};
