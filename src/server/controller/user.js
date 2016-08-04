'use strict';

var passport = require('passport');
var express = require('express');
var path = require('path');
var github = require('../services/github');

//////////////////////////////////////////////////////////////////////////////////////////////
// User controller
//////////////////////////////////////////////////////////////////////////////////////////////

var router = express.Router();

router.get('/auth/github',
    function(req, res, next) {

        var scope = null;

        if(req.query.scope === 'private') {
            scope = config.server.github.private_scope;
        }

        if(req.query.scope === 'public') {
            scope = config.server.github.public_scope;
        }

        passport.authenticate('github', {scope: scope})(req, res, next);
    }
);

router.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/'
    }),
    function(req, res) {
        github.call({
            obj: 'users',
            fun: 'get',
            arg: {},
            token: req.user.token
        }, function(err, user, meta) {
            if(meta && !meta['x-oauth-scopes']) {
                return res.redirect('/auth/github?scope=public');
            }
            res.redirect(req.session.next || '/');
            req.session.next = null;
        });
    }
);

router.get('/auth/slack', function(req, res, next) {

    req.session.next = req.query.next;

    req.session.repo = req.query.repo;

    passport.authorize('slack')(req, res, next);
});

router.get('/auth/slack/callback',
    function(req, res, next) {
        passport.authorize('slack', {failureRedirect: req.session.next || '/'})(req, res, next);
    },
    function(req, res) {
        res.redirect(req.session.next || '/');
        req.session.next = null;
        req.session.repo = null;
    }
);

router.get('/logout',
    function(req, res, next) {
        req.logout();
        res.redirect('/');
    }
);

module.exports = router;
