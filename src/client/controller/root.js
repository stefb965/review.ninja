'use strict';
// *****************************************************
// Root Controller
// *****************************************************

module.controller('RootCtrl', ['$rootScope', '$scope', '$stateParams', '$state', '$HUB', '$RPC', '$HUBService',
    function($rootScope, $scope, $stateParams, $state, $HUB, $RPC, $HUBService) {

        $rootScope.promise = $HUBService.wrap('users', 'get', {});

        $rootScope.promise.then(function(user) {
            $rootScope.user = user;
        });

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            $state.go('error');
        });

        //
        // Actions
        //

        $rootScope.dismiss = function(key, val) {
            $RPC.call('user', 'dismiss', {key: key, val: val}, function(err, res) {
                if(!err) {
                    $rootScope.user.value.history[key] = val || true;
                }
            });
        };
    }
]);
