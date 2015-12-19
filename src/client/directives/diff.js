'use strict';

// *****************************************************
// Diff File Directive
// *****************************************************

module.directive('diff', ['$stateParams', '$state', '$HUB', '$RPC', 'Reference',
    function($stateParams, $state, $HUB, $RPC, Reference) {
        return {
            restrict: 'E',
            templateUrl: '/directives/templates/diff.html',
            scope: {
                file: '=',
                thread: '=',
                split: '='
            },
            link: function(scope, elem, attrs) {

                scope.expanded = false;

                scope.blob = null;

                scope.open = !scope.file.ignored;

                scope.anchor = Reference.anchor;

                scope.$stateParams = $stateParams;

                //
                // Helper funtions
                //

                var expandPatch = function(content) {

                    var filePatch = [];

                    var base = 0, head = 0;

                    var insert = function(a, b) {
                        for(var i = a; i < b; i++) {
                            filePatch.push({
                                type: 'disabled',
                                head: i + 1,
                                base: ++base,
                                content: ' ' + content[i].content,
                                disabled: true
                            });
                        }
                    };

                    var patch = $.map(scope.file.patch, function(line) {
                        return !line.chunk ? line : null;
                    });

                    patch.forEach(function(line) {
                        insert(head, line.head - 1);
                        base = line.base || base;
                        head = line.head || head;
                        filePatch.push(line);
                    });

                    insert(head, content.length);

                    return filePatch;
                };

                var expandSplit = function(content) {

                    var fileSplit = [];

                    var base = 0, head = 0;

                    var insert = function(a, b) {
                        for(var i = a; i < b; i++) {
                            var line = {
                                type: 'disabled',
                                head: i + 1,
                                base: ++base,
                                content: ' ' + content[i].content,
                                disabled: true
                            };

                            fileSplit.push({base: line, head: line});
                        }
                    };

                    var split = $.map(scope.file.split, function(line) {
                        return !line.head && line.base.chunk ? null : line;
                    });

                    split.forEach(function(line) {
                        insert(head, line.head.head - 1);
                        base = line.base && line.base.base ? line.base.base : base;
                        head = line.head && line.head.head ? line.head.head : head;
                        fileSplit.push(line);
                    });

                    insert(head, content.length);

                    return fileSplit;
                };

                scope.expand = function() {

                    scope.expanded = !scope.expanded;

                    scope.blob = scope.blob || $HUB.wrap('gitdata', 'getBlob', {
                        user: $stateParams.user,
                        repo: $stateParams.repo,
                        sha: scope.file.sha
                    }, function(err, blob) {
                        if(!err) {
                            scope.file.filePatch = expandPatch(blob.value.content);
                            scope.file.fileSplit = expandSplit(blob.value.content);
                        }
                    });
                };

                scope.openRef = function(path, position) {
                    return scope.thread && scope.thread[Reference.get($stateParams.head, path, position)] && scope.thread[Reference.get($stateParams.head, path, position)].state !== 'closed';
                };

                scope.closedRef = function(path, position) {
                    return scope.thread && scope.thread[Reference.get($stateParams.head, path, position)] && scope.thread[Reference.get($stateParams.head, path, position)].state === 'closed';
                };

                scope.selected = function(path, position) {
                    return $stateParams.ref === Reference.get($stateParams.head, path, position);
                };

                scope.go = function(path, position) {
                    if(position) {
                        $state.go('repo.pull.review.reviewItem', {
                            head: $stateParams.head,
                            ref: Reference.get($stateParams.head, path, position)
                        });
                    }
                };

            }
        };
    }
]);
