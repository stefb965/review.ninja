'use strict';
// settings test
describe('Merge Directive', function() {

    var scope, repo, httpBackend, element, elScope, compile, timeout, pull;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.module('templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope, $compile, $stateParams, $timeout) {
        $stateParams.user = 'gabe';
        $stateParams.repo = 'test';
        $stateParams.number = 1;
        timeout = $timeout;

        httpBackend = $injector.get('$httpBackend');

        httpBackend.when('GET', '/config').respond({

        });

        httpBackend.when('POST', '/api/github/call', '{"obj":"orgs","fun":"getTeams","arg":' + JSON.stringify({
           user: 'gabe',
           repo: 'test',
           org: 'gabe'
        }) + '}').respond({
            data: [ { id:'red' }, { id: 'blue' } ]
        });

        compile = $compile;

        scope = $rootScope.$new();
        scope.permissions = {push: false};
        scope.pull = {
            base: {
                repo: {
                    id: 2
                }
            },
            head: {
                repo: {
                    id: 3
                },
                ref: 'master'
            },
            stars: [{name: 'gabe'}]
        };
        scope.repo = {organization: true};
        scope.reposettings = {value: {threshold: 2, reviewers: '2'}};
        scope.status = {statuses: ['closed']};
        element = $compile('<merge-button permissions="permissions" repo="repo" pull="pull" reposettings="reposettings" status="status"></merge-button>')(scope);
        scope.$digest();
        elScope = element.isolateScope();
    }));

    it('should get ref if base and head are equal', function() {
        httpBackend.expect('POST', '/api/github/call', '{"obj":"repos","fun":"getBranch","arg":' + JSON.stringify({
           user: 'gabe',
           repo: 'test',
           branch: 'master',
           headers: {'Accept': 'application/vnd.github.loki-preview+json'}
        }) + '}').respond({
            value: true
        });
        scope.permissions.push = true;
        scope.pull.head.repo.id = 2;
        element = compile('<merge-button permissions="permissions" repo="repo" pull="pull" reposettings="reposettings" status="status"></merge-button>')(scope);
        scope.$digest();
        elScope = element.isolateScope();
    });

    it('should watch status + set default status', function() {

    });

    it('should delete branch', function() {
        httpBackend.expect('POST', '/api/github/call', '{"obj":"gitdata","fun":"deleteReference","arg":' + JSON.stringify({
           user: 'gabe',
           repo: 'test',
           ref: 'heads/master'
        }) + '}').respond({
            value: true
        });
        elScope.deleteBranch();
        (elScope.showConfirmation).should.be.false;
        httpBackend.flush();
        ([elScope.branch]).should.be.eql([null]);
        (elScope.branchRemoved).should.be.true;
    });

    it('should merge branch', function() {
        httpBackend.expect('POST', '/api/github/call', '{"obj":"pullRequests","fun":"merge","arg":' + JSON.stringify({
           user: 'gabe',
           repo: 'test',
           number: 1
        }) + '}').respond(true);
        elScope.merge();
    });

    // should push onto stack
    it('should confirm', function() {
        elScope.confirm();
        (elScope.showConfirmation).should.be.true;
        timeout.flush();
        (elScope.showConfirmation).should.be.false;
    });
});
