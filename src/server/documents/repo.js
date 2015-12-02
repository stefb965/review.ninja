'use strict';

var mongoose = require('mongoose');

var RepoSchema = mongoose.Schema({
    repo: Number,
    slack: {
        token: {type: String, select: false},
        channel: String,
        events: {
            pull_request: {type: Boolean, default: true},
            star: {type: Boolean, default: true},
            merge: {type: Boolean, default: true}
        }
    },
    comment: {type: Boolean, default: true},
    threshold: {type: Number, min: 1, default: 1},
    reviewers: {type: String}
});

var Repo = mongoose.model('Repo', RepoSchema);

module.exports = {
    Repo: Repo
};
