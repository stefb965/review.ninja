'use strict';

describe('Markdown Factory', function() {

    var scope, repo, httpBackend, Markdown;

    beforeEach(angular.mock.module('app'));

    beforeEach(angular.mock.module('templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope, $stateParams) {
        $stateParams.user = 'github';
        $stateParams.repo = 'gollum';

        httpBackend = $injector.get('$httpBackend');

        httpBackend.when('GET', '/config').respond({});

        scope = $rootScope.$new();

        Markdown = $injector.get('Markdown');
        scope.$digest();
    }));

    it('should render comment in proper html', function() {
        var comment = {
          body: 'Hello world github/linguist#1 **cool**, and #1!'
        };

        var renderedHTML = {
            body: 'Hello world github/linguist#1 **cool**, and #1!',
            html: '<p>Hello world <a href="https://github.com/github/linguist/issues/1" class="issue-link" title="Binary detection issues on extensionless files">github/linguist#1</a> <strong>cool</strong>, and <a href="https://github.com/gollum/gollum/issues/1" class="issue-link" title="no method to write a file?">#1</a>!</p>'
        };

        httpBackend.expect('POST', '/api/github/call', '{"obj":"misc","fun":"renderMarkdown","arg":' + JSON.stringify({
          text: 'Hello world github/linguist#1 **cool**, and #1!',
          mode: 'gfm',
          context: 'github/gollum'
        }) + '}').respond({
            data: {
                data: '<p>Hello world <a href="https://github.com/github/linguist/issues/1" class="issue-link" title="Binary detection issues on extensionless files">github/linguist#1</a> <strong>cool</strong>, and <a href="https://github.com/gollum/gollum/issues/1" class="issue-link" title="no method to write a file?">#1</a>!</p>'
            }
        });

        var result = Markdown.render(comment);
        httpBackend.flush();

        (result).should.be.eql(renderedHTML);
    });

});
