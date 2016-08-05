'use strict';
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var request = require('request');
var github = require('../services/github');
var onboard = require('../services/onboard');

//////////////////////////////////////////////////////////////////////////////////////////////
// Default router
//////////////////////////////////////////////////////////////////////////////////////////////

var router = express.Router();

router.get('/accept', function(req, res) {
    var updateTerms = function() {
        models.User.update({
            uuid: req.user.id
        }, {
            terms: config.terms
        }, function(err, num, result) {
            res.redirect(req.session.next || '/');
            req.session.next = null;
        });
    };
    // to make sure a new repo is only created upon the first time user accepts terms
    // and not subsequent times user accepts terms
    models.User.findOne({
        uuid: req.user.id
    }, function(err, user) {
        updateTerms();
    });
});

router.all('/*', function(req, res) {

    res.set('Cache-Control', 'private, max-age=0, no-cache, no-store');

    if (req.isAuthenticated()) {
        models.User.findOne({
            uuid: req.user.id
        }, function(err, user) {

            if(!user) {
                req.logout();
                return res.sendFile('login.html', {root: __dirname + './../../client'});
            }

            if(!config.terms || user.terms === config.terms) {
                return res.sendFile('home.html', {root: __dirname + './../../client'});
            }

            request(config.terms, function(err, response, rawGist) {
                github.call({
                    obj: 'misc',
                    fun: 'renderMarkdown',
                    arg: {
                        text: rawGist
                    },
                    token: user.token
                }, function(err, renderedHtml) {

                    if(err) {
                        return res.sendFile('login.html', {root: __dirname + './../../client'});
                    }

                    req.session.next = req.path;
                    var template = fs.readFileSync('src/server/templates/terms.ejs', 'utf-8');
                    res.send(ejs.render(template, {termsHtml: renderedHtml.data}));
                });
            });
        });
    } else {
        req.session.next = req.path;
        res.sendFile('login.html', {root: __dirname + './../../client'});
    }
});

module.exports = router;
