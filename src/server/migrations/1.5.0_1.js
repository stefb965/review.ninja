'use strict';
exports.id = '1.5.0_1';

exports.up = function (done) {
    var Repo = this.db.collection('repos');
    Repo.ensureIndex({repo: 1}, {unique: true}, done);
};
