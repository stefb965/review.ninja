'use strict';

exports.id = '1.5.0';

// modules
var merge = require('merge');

exports.up = function(done) {

    var Repo = this.db.collection('repos');
    var Slack = this.db.collection('slacks');

    Repo.find({}).toArray(function(err, repos) {
        if(err) {
            return done(err);
        }

        repos.forEach(function(repo) {
            if(repo.slack) {
                // set new slack document
                Slack.insert(merge({repo: repo.repo}, repo.slack));

                // remove slack from repo document
                Repo.update(repo, {$unset: {slack: 1}});
            }
        });

        done();
    });
};
