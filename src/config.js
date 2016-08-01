'use strict';

/**
 * Configuration Module
 *
 * @title config
 * @overview Configuration Module
 */


var merge = require('merge');
var mongoURI = require('mongodb-uri');

module.exports = {

    terms: process.env.TERMS_URL,

    milestone_prefix: process.env.MILESTONE_PREFIX || '',

    server: {
        github: {
            // optional
            protocol: process.env.GITHUB_PROTOCOL || 'https',
            host: process.env.GITHUB_HOST || 'github.com',
            api: process.env.GITHUB_API_HOST || 'api.github.com',
            pathprefix: process.env.GITHUB_API_PATHPREFIX,
            version: process.env.GITHUB_VERSION || '3.0.0',
            port: process.env.GITHUB_PROTOCOL === 'http' ? 80 : 443,

            enterprise: process.env.GITHUB_ENTERPRISE || !!process.env.GITHUB_HOST,

            // required
            client: process.env.GITHUB_CLIENT,
            secret: process.env.GITHUB_SECRET,

            // required
            user: process.env.GITHUB_USER,
            pass: process.env.GITHUB_PASS,

            // review.ninja specific
            public_scope: ['user:email', 'public_repo', 'repo:status', 'read:repo_hook', 'write:repo_hook', 'read:org'],
            private_scope: ['user:email', 'repo', 'repo:status', 'read:repo_hook', 'write:repo_hook', 'read:org'],
            webhook_events: ['pull_request', 'pull_request_review_comment', 'issues', 'issue_comment', 'status']
        },

        slack: {
            host: process.env.SLACK_HOST,
            port: process.env.SLACK_PORT,
            path: process.env.SLACK_PATH,
            client: process.env.SLACK_CLIENT,
            secret: process.env.SLACK_SECRET
        },

        localport: process.env.PORT || 5000,

        always_recompile_less: process.env.NODE_ENV === 'production' ? false : true,

        http: {
            protocol: process.env.PROTOCOL || 'http',
            host: process.env.HOST || 'localhost',
            port: process.env.HOST_PORT || (!process.env.HOST ? 5000 : null)
        },

        https: {
            certs: process.env.CERT
        },

        security: {
            sessionSecret: process.env.SESSION_SECRET || 'review.ninja',
            cookieMaxAge: 60 * 60 * 1000
        },

        smtp: {
            enabled: !!process.env.SMTP_HOST,
            host: process.env.SMTP_HOST,
            secure: (!!process.env.SMTP_SSL && process.env.SMTP_SSL === 'true'),
            port: process.env.SMTP_PORT,
            auth: process.env.SMTP_USER ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            } : undefined,
            name: process.env.HOST || 'review.ninja',
            from: process.env.SMTP_FROM || 'ReviewNinja <noreply@review.ninja>',
            ignoreTLS: process.env.SMTP_TLS === 'true'
        },

        mongodb: (function() {

            var uri = mongoURI.parse(process.env.MONGODB || process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/reviewninja');

            var config = uri.options && uri.options.replicaSet ? {
                replicaset: {
                    name: uri.options.replicaSet,
                    members: uri.hosts.map(function(m) { return { host: m.host, port: m.port || 27017 }; })
                }
            } : {
                host: uri.hosts[0].host,
                port: uri.hosts[0].port || 27017
            };

            return merge({
                db: uri.database,
                user: uri.username,
                password: uri.password,
                collection: 'migrations',
                ssl: uri.options && uri.options.ssl
            }, config);

        })(),

        mongodb_uri: process.env.MONGODB || process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/reviewninja',

        static: {
            lib: [__dirname + '/bower'],
            app: [__dirname + '/client']
        },

        api: [
            __dirname + '/server/api/*.js'
        ],

        webhooks: [
            __dirname + '/server/webhooks/*.js'
        ],

        migrations: [
            __dirname + '/server/migrations/*.js'
        ],

        documents: [
            __dirname + '/server/documents/*.js'
        ],

        controller: [
            __dirname + '/server/controller/!(default).js',
            __dirname + '/server/controller/default.js'
        ],

        middleware: [
            __dirname + '/server/middleware/*.js'
        ],

        passport: [
            __dirname + '/server/passports/*.js'
        ],

        monkey: [
            __dirname + '/server/monkey/*.js'
        ]
    },

    client: {
        gacode: process.env.GACODE,
        survey: process.env.SURVEY_URL
    }

};
