'use strict';
// settings test
describe('Root Controller', function() {

    var rootScope, scope, repo, httpBackend, createCtrl, q;

    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope, $controller, $stateParams, $q) {
        $stateParams.user = 'gabe';
        $stateParams.repo = 1234;
        httpBackend = $injector.get('$httpBackend');

        httpBackend.when('GET', '/config').respond({});

        httpBackend.when('POST', '/api/github/wrap', '{"obj":"users","fun":"get","arg":' + JSON.stringify({
        }) + '}').respond({
            data: {
                id: 2757082,
                login: 'login-1',
                repos: [1234, 1235, 1236],
                history: {'create': false}
            }
        });

        rootScope = $rootScope;
        scope = $rootScope.$new();
        q = $q;
        var deferred = q.defer();
        deferred.resolve({
            value: {
                id: 2757082,
                login: 'login-1',
                repos: [1234, 1235, 1236]
            }
        });
        var promise = deferred.promise;
        rootScope.promise = promise;

        scope.query = 'user/repo';
        // rootScope.promise = promise;

        createCtrl = function() {
            var ctrl = $controller('RootCtrl', {
                $scope: scope,
                $rootScope: rootScope,
                $stateParams: $stateParams,
                socket: {connect: function(){}}
            });
            return ctrl;
        };
    }));

    it('should do stuff with state change success', function() {
        rootScope.$broadcast('$stateChangeSuccess');
    });

    // create promise
    // get user and repo params
    // should change to error on statechangeerror

    it('should send call to dismiss from history', function() {
        httpBackend.expect('POST', '/api/user/dismiss', JSON.stringify({
            key: 'create'
        })).respond({
            value: true
        });
        var ctrl = createCtrl();
        scope.dismiss('create');
        httpBackend.flush();
        (rootScope.user.value.history.create).should.be.true;
    });
});
