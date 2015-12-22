'use strict';

module.exports = function(req, res, next) {

    var Repo = require('mongoose').model('Repo');

    req.args.token = null;

    if(!req.args.repository) {
        return next();
    }

    Repo.findOne({repo: req.args.repository.id}).select('+token').exec(function(err, repo) {
        req.args.token = repo ? repo.token : null;
        next();
    });
};
