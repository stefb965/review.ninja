'use strict';

var mongoose = require('mongoose');

var SettingsSchema = mongoose.Schema({
    user: Number,
    repo: Number,
    notifications: {
        pull_request: {type: Boolean, default: false},
        review_thread: {type: Boolean, default: false},
        star: {type: Boolean, default: false}
    },
    watched: [String]
});

SettingsSchema.index({
    user: 1,
    repo: 1
}, {
    unique: true
});

var Settings = mongoose.model('Settings', SettingsSchema);

module.exports = {
    Settings: Settings
};
