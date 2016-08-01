'use strict';
// settings test
describe('Pull Controller', function() {

    var scope, rootScope, repo, httpBackend, createCtrl, PullCtrl, PullMock, IssueMock, MarkdownMock, CommentMock, SocketMockFunc, SocketMock, ModalMock, q;

    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('templates'));
    beforeEach(function() {
        //mock services
        PullMock = {
            render: function(pull) {
                return pull;
            },
            stars: function(pull, bool) {
                return pull;
            },
            status: function(pull) {
                return pull;
            }
        };

        IssueMock = {
            parse: function(issue) {
                return issue.body;
            }
        };

        MarkdownMock = {
            render: function(obj) {
                return obj;
            }
        };

        CommentMock = {
            thread: function(comments) {
                return comments;
            },
            review: function(comment) {
                return comment;
            }
        };

        SocketMockFunc = function($rootScope) {
            this.events = {};
            this.on = function(evt, cb) {
                if(!this.events[evt]) {
                    this.events[evt] = [];
                }
                this.events[evt].push(cb);
            };
            this.receive = function(evt) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (this.events[evt]) {
                    this.events[evt].forEach(function(cb){
                        $rootScope.$apply(function() {
                            cb.apply(this, args);
                        });
                    });
                }
            };
        };

        ModalMock = {
            open: function(obj) {
                return obj;
            }
        };
    });

    beforeEach(angular.mock.inject(function($injector) {
        // http requests
        httpBackend = $injector.get('$httpBackend');
        httpBackend.when('GET', '/config').respond({});

        httpBackend.expect('POST', '/api/github/call', '{"obj":"misc","fun":"getEmojis"}').respond({
            value: 'success'
        });

        httpBackend.expect('POST', '/api/github/call', '{"obj":"repos","fun":"getCombinedStatus","arg":' + JSON.stringify({
          user: 'gabe',
          repo: 'test',
          sha: 'abcd1234'
        }) + '}').respond({
            value: 'success'
        });

        httpBackend.expect('POST', '/api/repo/get', JSON.stringify({
          repo_uuid: 1
        })).respond({
            value: 'success'
        });

        httpBackend.expect('POST', '/api/github/call', '{"obj":"issues","fun":"getComments","arg":' + JSON.stringify({
          user: 'gabe',
          repo: 'test',
          number: 1
        }) + '}').respond({
            data: [{body: 'test'},
            {body: 'this'}]
        });

        httpBackend.expect('POST', '/api/github/call', '{"obj":"pullRequests","fun":"getComments","arg":' + JSON.stringify({
          user: 'gabe',
          repo: 'test',
          number: 1,
          per_page: 100
        }) + '}').respond({
            data: [{body: 'test'},
            {body: 'this'}]
        });

        httpBackend.expect('POST', '/api/github/call', JSON.stringify({
          obj: 'repos',
          fun: 'getCollaborators',
          arg: {
            user: 'gabe',
            repo: 'test'
          }
        })).respond({
            value: 'success'
        });

        httpBackend.expect('POST', '/api/github/call', JSON.stringify({
          obj: 'repos',
          fun: 'getBranch',
          arg: {
            user: 'gabe',
            repo: 'test',
            branch: 'master',
            headers: {'Accept': 'application/vnd.github.loki-preview+json'}
          }
        })).respond({
            value: 'success'
        });
    }));


    beforeEach(angular.mock.inject(function($injector, $rootScope, $controller, $state, $stateParams, $q) {

        $stateParams.user = 'gabe';
        $stateParams.repo = 'test';
        $stateParams.number = 1;

        scope = $rootScope.$new();
        rootScope = $rootScope;

        q = $q;

        SocketMock = new SocketMockFunc($rootScope);

        var fakePull = {
            base: {
                repo: {
                    owner: {
                        login: 'gabe'
                    },
                    name: 'repo1',
                    id: 11111
                },
                ref: 'master'
            },
            head: {
                sha: 'abcd1234'
            },
            milestone: {
                number: 1,
                id: 1234
            },
            body: 'hello world',
            number: 1,
            stars: [{name: 'gabe'}]
        };

        createCtrl = function() {
            var ctrl = $controller('PullCtrl', {
                $scope: scope,
                $rootScope: rootScope,
                $modal: ModalMock,
                Pull: PullMock,
                Issue: IssueMock,
                Comment: CommentMock,
                Markdown: MarkdownMock,
                repo: {value: {id: 1}},
                pull: {value: fakePull},
                socket: SocketMock
            });
            return ctrl;
        };
    }));

    // set all the stuff
    it('should set stuff', function() {
        PullCtrl = createCtrl();
        httpBackend.flush();
    });

    // set star on pr
    it('should set star', function() {
        PullCtrl = createCtrl();
        httpBackend.expect('POST', '/api/star/set', JSON.stringify({
            repo: 'test',
            user: 'gabe',
            sha: 'abcd1234',
            number: 1,
            repo_uuid: 11111
        })).respond({
            value: true
        });
        scope.setStar();
        httpBackend.flush();
    });

    // add comment
    it('should add comment', function() {
        httpBackend.expect('POST', '/api/github/wrap', '{"obj":"issues","fun":"createComment","arg":' + JSON.stringify({
          user: 'gabe',
          repo: 'test',
          number: 1,
          body: 'lol'
        }) + '}').respond({
            value: true
        });
        var PullCtrl = createCtrl();
        scope.addComment({body: 'lol'});
        httpBackend.flush();
        ([scope.comment]).should.be.eql([{}]);
    });

    // watch

    // badge modal
    it('should call to open modal', function() {
        var PullCtrl = createCtrl();
        scope.badge();
    });

    // all the socket functions
    // getting status via websocket
    it('should update status with websocket event', function() {
        var PullCtrl = createCtrl();
        scope.status = {};
        httpBackend.expect('POST', '/api/github/call', '{"obj":"repos","fun":"getCombinedStatus","arg":' + JSON.stringify({
          user: 'gabe',
          repo: 'test',
          sha: 'abcd1234'
        }) + '}').respond({
            data: 'tested'
        });
        SocketMock.receive('gabe:test:status', {sha: 'abcd1234'});
        httpBackend.flush();
        (scope.status.value).should.be.exactly('tested');
    });

    // getting  stars via websocket
    it('should update stars with websocket event', function() {
        var PullCtrl = createCtrl();
        scope.pull = {number: 1};
        SocketMock.receive('gabe:test:pull_request_star', {number: 1, action: 'starred'});
        (scope.pull).should.be.eql({number: 1});
        SocketMock.receive('gabe:test:pull_request_star', {number: 1, action: 'unstarred'});
        (scope.pull).should.be.eql({number: 1});
    });

    // create comment event
    it('should push new comment with websocket event', function() {
        var PullCtrl = createCtrl();
        scope.conversation = {value: []};
        httpBackend.expect('POST', '/api/github/call', '{"obj":"issues","fun":"getComment","arg":' + JSON.stringify({
          user: 'gabe',
          repo: 'test',
          id: 1234
        }) + '}').respond({
            data: {body: 'comment'}
        });
        SocketMock.receive('gabe:test:issue_comment', {number: 1, action: 'created', id: 1234});
        httpBackend.flush();
        (scope.conversation.value).should.be.eql([{body: 'comment'}]);
    });
});
