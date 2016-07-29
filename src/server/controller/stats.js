'use strict';

// modules
var express = require('express');

// services
var github = require('../services/github');

// models
var User = require('mongoose').model('User');
var Star = require('mongoose').model('Star');

var router = express.Router();

router.all('/stats/user', function(req, res) {
    User.count({}, function(err, count) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            stat: count,
            text: 'There are ' + count + ' users!'
        }));
    });
});

router.all('/stats/star', function(req, res) {
    Star.count({}, function(err, count) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            stat: count,
            text: 'There are ' + count + ' ninja stars!'
        }));
    });
});

router.all('/stats/release', function(req, res) {
    github.call({
        obj: 'repos',
        fun: 'getLatestRelease',
        arg: {
            user: 'reviewninja',
            repo: 'review.ninja',
            basicAuth: config.server.github.user ? {
                user: config.server.github.user,
                pass: config.server.github.pass
            } : null
        }
    }, function(err, release) {
        release = release || {name: '0.0.0'};
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            stat: release.name,
            text: 'The current release is ' + release.name
        }));
    });
});

module.exports = router;
