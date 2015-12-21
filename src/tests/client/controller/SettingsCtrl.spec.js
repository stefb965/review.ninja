'use strict';
// settings test
describe('Settings Controller', function() {

    var scope, repo, httpBackend, createCtrl, callSlack;

    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope, $controller, $stateParams) {

        $stateParams.user = 'user';
        $stateParams.repo = 'repo';

        httpBackend = $injector.get('$httpBackend');

        httpBackend.when('GET', '/config').respond({});

        scope = $rootScope.$new();

        repo = {
            value: {
                id: 1234,
                organization: {login: 'login'}
            }
        };
        createCtrl = function() {
            var ctrl = $controller('SettingsCtrl', {
                $scope: scope,
                repo: repo
            });
            ctrl.scope = scope;
            return ctrl;
        };
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should add watched', function() {
        var ctrl = createCtrl();

        httpBackend.expect('POST', '/api/settings/get').respond({
            settings: 'settings',
            watched: ['one', 'two']
        });
        httpBackend.expect('POST', '/api/repo/get').respond({
            repo: 1234
        });
        httpBackend.expect('POST', '/api/slack/get').respond({
            repo: 1234,
            events: {merge: true},
            token: true,
            channel: '#bottesting'
        });
        httpBackend.expect('POST', '/api/github/call', '{"obj":"orgs","fun":"getTeams","arg":{"user":"user","repo":"repo","org":"login"}}').respond([
            {
                id: 1,
                name: 'reviewTeam'
            }
        ]);
        httpBackend.expect('POST', '/api/slack/token').respond(false);

        httpBackend.flush();

        scope.addWatch('feature/*');

        httpBackend.expect('POST', '/api/settings/setWatched').respond(ctrl.scope.settings.value);
        httpBackend.flush();
        (scope.settings.value.watched.length).should.be.exactly(3);
        (ctrl.scope.repoSettings.value.repo).should.be.exactly(1234);
    });

    it('should remove watched', function() {
        var ctrl = createCtrl();

        httpBackend.expect('POST', '/api/settings/get').respond({
            repo: 1234,
            watched: ['one', 'two']
        });
        httpBackend.expect('POST', '/api/repo/get').respond({
            repo: 1234
        });
        httpBackend.expect('POST', '/api/slack/get').respond({
            repo: 1234,
            events: {merge: true},
            token: true,
            channel: '#bottesting'
        });
        httpBackend.expect('POST', '/api/github/call', '{"obj":"orgs","fun":"getTeams","arg":{"user":"user","repo":"repo","org":"login"}}').respond([
            {
                id: 1,
                name: 'reviewTeam'
            }
        ]);
        httpBackend.expect('POST', '/api/slack/token').respond(false);

        httpBackend.flush();

        ctrl.scope.removeWatch('two');

        httpBackend.expect('POST', '/api/settings/setWatched').respond(ctrl.scope.settings.value);
        httpBackend.flush();

        (ctrl.scope.settings.value.watched.length).should.be.exactly(1);
        (ctrl.scope.repoSettings.value.repo).should.be.exactly(1234);
    });

    it('should set Notifications', function() {

        var ctrl = createCtrl();

        httpBackend.expect('POST', '/api/settings/get').respond({
            repo: 1234,
            watched: ['one', 'two'],
            notifications: ['yo wassup']

        });
        httpBackend.expect('POST', '/api/repo/get').respond({
            repo: 1234
        });
        httpBackend.expect('POST', '/api/slack/get').respond({
            repo: 1234,
            events: {merge: true},
            token: true,
            channel: '#bottesting'
        });
        httpBackend.expect('POST', '/api/github/call', '{"obj":"orgs","fun":"getTeams","arg":{"user":"user","repo":"repo","org":"login"}}').respond([
            {
                id: 1,
                name: 'reviewTeam'
            }
        ]);
        httpBackend.expect('POST', '/api/slack/token').respond(false);

        httpBackend.flush();

        ctrl.scope.setNotifications();

        httpBackend.expect('POST', '/api/settings/setNotifications').respond(ctrl.scope.settings.value);
        httpBackend.flush();

        (ctrl.scope.settings.value.notifications.length).should.be.exactly(1);
        (ctrl.scope.repoSettings.value.repo).should.be.exactly(1234);

    });

    it('should change threshold', function() {

        var ctrl = createCtrl();

        httpBackend.expect('POST', '/api/settings/get').respond({
            repo: 1234,
            watched: ['one', 'two'],
            notifications: ['yo wassup']
        });
        httpBackend.expect('POST', '/api/repo/get').respond({
            repo: 1234
        });
        httpBackend.expect('POST', '/api/slack/get').respond({
            repo: 1234,
            events: {merge: true},
            token: true,
            channel: '#bottesting'
        });
        httpBackend.expect('POST', '/api/github/call', '{"obj":"orgs","fun":"getTeams","arg":{"user":"user","repo":"repo","org":"login"}}').respond([
            {
                id: 1,
                name: 'reviewTeam'
            }
        ]);
        httpBackend.expect('POST', '/api/slack/token').respond(false);

        httpBackend.flush();

        httpBackend.expect('POST', '/api/repo/set', JSON.stringify({threshold: 2, repo_uuid: 1234})).respond({
            repo: 1234,
            threshold: 2
        });

        ctrl.scope.setRepo({threshold: 2});
        httpBackend.flush();

        (ctrl.scope.repoSettings.value.repo).should.be.exactly(1234);
        (ctrl.scope.repoSettings.value.threshold).should.be.exactly(2);
    });

    it('should toggle comments', function() {

        var ctrl = createCtrl();

        httpBackend.expect('POST', '/api/settings/get').respond({
            repo: 1234,
            watched: ['one', 'two'],
            notifications: ['yo wassup']
        });
        httpBackend.expect('POST', '/api/repo/get').respond({
            repo: 1234
        });
        httpBackend.expect('POST', '/api/slack/get').respond({
            repo: 1234,
            events: {merge: true},
            token: true,
            channel: '#bottesting'
        });
        httpBackend.expect('POST', '/api/github/call', '{"obj":"orgs","fun":"getTeams","arg":{"user":"user","repo":"repo","org":"login"}}').respond([
            {
                id: 1,
                name: 'reviewTeam'
            }
        ]);
        httpBackend.expect('POST', '/api/slack/token').respond(false);

        httpBackend.flush();

        httpBackend.expect('POST', '/api/repo/set', JSON.stringify({comment: true, repo_uuid: 1234})).respond({
            repo: 1234,
            comment: true
        });

        ctrl.scope.setRepo({comment: true});
        httpBackend.flush();

        (ctrl.scope.repoSettings.value.repo).should.be.exactly(1234);
        (ctrl.scope.repoSettings.value.comment).should.be.true;
    });

    it('should set a review team', function() {

        var ctrl = createCtrl();

        httpBackend.expect('POST', '/api/settings/get').respond({
            repo: 1234,
            watched: ['one', 'two'],
            notifications: ['yo wassup'],
            reviewers: null
        });
        httpBackend.expect('POST', '/api/repo/get').respond({
            repo: 1234
        });
        httpBackend.expect('POST', '/api/slack/get').respond({
            repo: 1234,
            events: {merge: true},
            token: true,
            channel: '#bottesting'
        });
        httpBackend.expect('POST', '/api/github/call', '{"obj":"orgs","fun":"getTeams","arg":{"user":"user","repo":"repo","org":"login"}}').respond({
            data: [
                {
                    id: 1,
                    name: 'reviewTeam'
                }
            ]
        });
        httpBackend.expect('POST', '/api/slack/token').respond(false);

        httpBackend.flush();

        httpBackend.expect('POST', '/api/repo/set', JSON.stringify({reviewers: 1, repo_uuid: 1234})).respond({
            repo: 1234,
            reviewers: 1
        });

        ctrl.scope.setRepo({reviewers: 1});
        httpBackend.flush();

        (ctrl.scope.repoSettings.value.repo).should.be.exactly(1234);
        (ctrl.scope.repoSettings.value.reviewers).should.be.exactly(1);
        (ctrl.scope.reviewTeam.id).should.be.exactly(1);
        (ctrl.scope.reviewTeam.name).should.be.exactly('reviewTeam');
    });

});
