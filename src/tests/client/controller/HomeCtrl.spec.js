'use strict';
// home test
describe('Home Controller', function() {

    var scope, httpBackend, createCtrl, rootScope;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.module('templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope, $controller, $q, $stateParams) {

        httpBackend = $injector.get('$httpBackend');

        httpBackend.when('GET', '/config').respond({});

        httpBackend.expect('POST', '/api/github/call', '{"obj":"repos","fun":"getAll","arg":' + JSON.stringify({
           per_page: 50
        }) + '}').respond({
            value: {
                repos: [123, 134, 123]
            }
        });

        httpBackend.expect('POST', '/api/user/authorization').respond({value: true});

        scope = $rootScope.$new();
        rootScope = $rootScope;

        // create promise for user
        var deferred = $q.defer();
        deferred.resolve({
            value: {
                id: 2757082,
                login: 'gabe',
                repos: [1234]
            }
        });
        var promise = deferred.promise;

        scope.query = 'user/repo';
        rootScope.promise = promise;
        rootScope.dismiss = function(str) {
            return true;
        };
        rootScope.$digest();
        rootScope.$apply();

        createCtrl = function() {
            return $controller('HomeCtrl', {
                $scope: scope,
                $rootScope: rootScope
            });
        };
    }));

    it('should load all the things', function() {
        var repoIds = [1234];
        repoIds.forEach(function(id, index) {
            httpBackend.expect('POST', '/api/github/call', '{"obj":"repos","fun":"one","arg":{"id":' + id.toString() + '}}').respond({
                value: {
                    name: 'repo-' + (index + 1).toString(),
                    user: 'me',
                    id: id
                }
            });
        });
        var HomeCtrl = createCtrl();
        scope.$apply();
        (scope.repos).should.be.empty;
        (scope.loaded).should.be.false;
        (scope.show).should.be.false;
        httpBackend.flush();
    });

    it('should send call to add repo', function() {
        // filler request
        httpBackend.expect('POST', '/api/github/call').respond({value: true});
        var HomeCtrl = createCtrl();
        httpBackend.flush();
        httpBackend.expect('POST', '/api/user/addRepo', JSON.stringify({
           user: 'gabe',
           repo: 'lol',
           repo_uuid: 1234
        })).respond({
            value: true
        });
        var fakeRepo = {owner: {login: 'gabe'}, name: 'lol', id: 1234};
        var doneFn = function(err, res) {
            if (!err) {
                return true;
            }
        };
        scope.add(fakeRepo, doneFn);
        httpBackend.flush();
    });

    it('should send call with rmv to change active status with admin permission', function() {
        // if scope.active === fakerepo
        var HomeCtrl = createCtrl();
        scope.active = {name: 'test', permissions: {admin: true}};
        var fakeRepo = scope.active;
        scope.rmv(fakeRepo);
        ([scope.active]).should.be.eql([null]);

        // if scope.active !== fakerepo
        scope.active = {name: 'test', permissions: {admin: true}};
        fakeRepo = {name: 'random', permissions: {admin: true}};
        scope.rmv(fakeRepo);
        (scope.active).should.be.eql(fakeRepo);
    });

    it('should send call with rmv to remove repo without admin permission', function() {
        var HomeCtrl = createCtrl();
        var fakeRepo = {name: 'test', permissions: {admin: false}};
        var removeStub = sinon.stub(scope, 'remove', function(repo) {
            (repo).should.be.eql({name: 'test', permissions: {admin: false}});
        });
        scope.rmv(fakeRepo);
        removeStub.restore();
    });

    it('should send call to delete repo', function() {
        httpBackend.expect('POST', '/api/github/call').respond({value: true});
        var HomeCtrl = createCtrl();
        httpBackend.flush();
        scope.repos = [{owner: {login: 'gabe'}, name: 'lol', id: 1234}];
        httpBackend.expect('POST', '/api/user/rmvRepo', JSON.stringify({
           user: 'gabe',
           repo: 'lol',
           repo_uuid: 1234
        })).respond({
            value: true
        });
        var fakeRepo = {owner: {login: 'gabe'}, name: 'lol', id: 1234};
        scope.remove(fakeRepo);
        httpBackend.flush();
        (scope.repos).should.be.empty;
    });

    it('should send call to remove webhook', function() {
        httpBackend.expect('POST', '/api/github/call').respond({value: true});
        var HomeCtrl = createCtrl();
        httpBackend.flush();
        var fakeRepo = {id: 1};
        httpBackend.expect('POST', '/api/webhook/remove', {
            repo_uuid: 1
        }).respond({
            data: true
        });
        var removeStub = sinon.stub(scope, 'remove', function(repo) {
            (repo).should.be.eql({id: 1});
        });
        scope.removeWebhook(fakeRepo);
        httpBackend.flush();
        removeStub.restore();
    });

    it('should send call to create onboarding repo', function() {
        httpBackend.expect('POST', '/api/github/call').respond({value: true});
        var HomeCtrl = createCtrl();
        httpBackend.flush();
        scope.repos = [];
        httpBackend.expect('POST', '/api/onboard/createrepo', JSON.stringify({})).respond({
            owner: {login: 'gabe'}, name: 'onboarding', id: 1234
        });
        httpBackend.expect('POST', '/api/user/addRepo', JSON.stringify({
           user: 'gabe',
           repo: 'onboarding',
           repo_uuid: 1234
        })).respond({
            value: true
        });
        var clock = sinon.useFakeTimers(11111);
        scope.createOnboardingRepo();
        httpBackend.flush();
        (scope.repos).should.be.eql([{owner: {login: 'gabe'}, name: 'onboarding', id: 1234, adddate: -11111}]);
        clock.restore();
    });
});
