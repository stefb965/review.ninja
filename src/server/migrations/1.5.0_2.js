'use strict';
exports.id = '1.5.0_2';

exports.up = function (done) {
    var Settings = this.db.collection('settings');
    Settings.ensureIndex({user: 1, repo: 1}, {unique: true}, done);
};
