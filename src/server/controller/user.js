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
            obj: 'user',
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

router.get('/auth/slack',
    passport.authorize('slack'));

router.get('/auth/slack/callback',
    passport.authorize('slack'),
    function(req, res) {
        // do something
        res.redirect('/');
    }
);

router.get('/logout',
    function(req, res, next) {
        req.logout();
        res.redirect('/');
    }
);

module.exports = router;
