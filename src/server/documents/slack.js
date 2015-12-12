'use strict';

var mongoose = require('mongoose');

var SlackSchema = mongoose.Schema({
    repo: Number,
    token: {type: String, select: false},
    channel: {type: String, default: '#general'},
    events: {
        pull_request: {type: Boolean, default: true},
        star: {type: Boolean, default: true},
        merge: {type: Boolean, default: true}
    }
});

SlackSchema.index({
    repo: 1
}, {
    unique: true
});


var Slack = mongoose.model('Slack', SlackSchema);

module.exports = {
    Slack: Slack
};
