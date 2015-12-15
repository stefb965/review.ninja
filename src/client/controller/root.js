'use strict';
// *****************************************************
// Root Controller
// *****************************************************

module.controller('RootCtrl', ['$rootScope', '$scope', '$stateParams', '$state', '$HUB', '$RPC', '$HUBService',
    function($rootScope, $scope, $stateParams, $state, $HUB, $RPC, $HUBService) {

        $rootScope.promise = $HUBService.wrap('user', 'get', {});

        $rootScope.promise.then(function(user) {
            $rootScope.user = user;
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            $state.go('error');
        });

        //
        // Actions
        //

        $rootScope.createWebhook = function() {
            $scope.create = $RPC.call('webhook', 'create', {repo_uuid: $rootScope.repo_uuid}, function(err) {
                if(!err) {
                    $rootScope.webhook.value = true;
                }
            });
        };

        $rootScope.addToken = function() {
            $scope.add = $RPC.call('repo', 'set', {repo_uuid: $rootScope.repo_uuid, token: true}, function(err) {
                if(!err) {
                    $rootScope.token.value = true;
                }
            });
        };

        $rootScope.dismiss = function(key, val) {
            $RPC.call('user', 'dismiss', {key: key, val: val}, function(err, res) {
                if(!err) {
                    $rootScope.user.value.history[key] = val || true;
                }
            });
        };
    }
]);
