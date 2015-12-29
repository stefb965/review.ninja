'use strict';
// *****************************************************
// Onboard Directive
// *****************************************************

module.directive('onboard', ['$rootScope', '$stateParams', '$RPC', '$timeout', 'socket',
    function($rootScope, $stateParams, $RPC, $timeout, socket) {
        return {
            restrict: 'E',
            templateUrl: '/directives/templates/onboard.html',
            link: function(scope, elem, attrs) {
                scope.actions = [
                    {key: 'user:addRepo', text: 'Add repo'},
                    {key: 'pullRequests:get', text: 'View pull request', elementclass: 'ob-pull'},
                    {key: 'pullRequests:createComment', text: 'Create line note', elementclass: 'ob-create'},
                    {key: 'pullRequests:createFixComment', text: 'Create comment with !fix status', elementclass: 'ob-addstatus'},
                    {key: 'pullRequests:createFixedComment', text: 'Create comment with !fixed status', elementclass: 'ob-addstatus'},
                    {key: 'star:add', text: 'Add ninja star', elementclass: 'ob-star'},
                    {key: 'pullRequests:merge', text: 'Merge pull request', elementclass: 'ob-merge'}
                ];

                var getActions = function() {
                    $RPC.call('onboard', 'getactions', {
                        user: $stateParams.user,
                        repo: $stateParams.repo
                    }, function(err, actions) {
                        if(!err) {
                            var completed = 0;
                            scope.actions.forEach(function(action) {
                                action.val = actions.value[action.key];
                                if(action.val) {
                                    completed = completed + 1;
                                }
                            });
                            scope.complete = (scope.actions.length === completed);
                        }
                    });
                };

                scope.addClass = function(name) {
                    $rootScope.ob = name;
                };

                scope.removeClass = function(name) {
                    $rootScope.ob = null;
                };

                getActions();

                $rootScope.promise.then(function(user) {
                    socket.on('action:' + user.value.id, function() {
                        getActions();
                    });
                });
            }
        };
    }
]);
