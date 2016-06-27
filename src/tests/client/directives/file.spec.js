'use strict';
// settings test
describe('File Directive', function() {

    var scope, repo, httpBackend, element, elScope, Reference;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.module('templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope, $compile, reference, $stateParams) {
        $stateParams.issue = 2;

        httpBackend = $injector.get('$httpBackend');

        httpBackend.when('GET', '/config').respond({

        });

        Reference = reference;
        scope = $rootScope.$new();
        element = $compile('<file></file>')(scope);
        scope.$digest();
        elScope = element.isolateScope();
        elScope.headSha = 'aaaa';
        elScope.path = 'hello/world';
    }));
});
