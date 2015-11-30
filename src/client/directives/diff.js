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

                scope.expand = function() {

                    scope.expanded = !scope.expanded;

                    scope.blob = scope.blob || $HUB.wrap('gitdata', 'getBlob', {
                        user: $stateParams.user,
                        repo: $stateParams.repo,
                        sha: scope.file.sha
                    }, function(err, blob) {
                        if(!err) {

                            scope.file.file = [];

                            var base = 0, head = 0;

                            var insert = function(a, b) {
                                for(var i = a; i < b; i++) {
                                    scope.file.file.push({
                                        type: 'disabled',
                                        head: i + 1,
                                        base: ++base,
                                        content: blob.value.content[i].content,
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

                                scope.file.file.push(line);

                            });

                            insert(head, blob.value.content.length);
                        }
                    });
                };

                //
                // Helper funtions
                //

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
