'use strict';

var mongoose = require('mongoose');

var RepoSchema = mongoose.Schema({
    repo: Number,
    token: {type: String, select: false},
    webhook: {type: String, select: false},
    comment: {type: Boolean, default: true},
    threshold: {type: Number, min: 1, max: 99, default: 1}
});

RepoSchema.index({
    repo: 1
}, {
    unique: true
});


var Repo = mongoose.model('Repo', RepoSchema);

module.exports = {
    Repo: Repo
};
