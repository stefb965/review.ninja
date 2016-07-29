'use strict';
// *****************************************************
// Home Controller
//
// tmpl: home.html
// path: /
// *****************************************************

module.controller('HomeCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$modal', '$HUB', '$RPC',
    function($rootScope, $scope, $state, $stateParams, $modal, $HUB, $RPC) {

        $scope.repos = [];

        $scope.allRepos = $HUB.call('repos', 'getAll', {per_page: 50});

        $rootScope.promise.then(function(user) {
            var count = 0;
            var repos = user && user.value ? user.value.repos : [];

            $scope.loaded = count === repos.length;

            $scope.show = $stateParams.addrepo || ($scope.loaded && user.value.history.welcome);

            repos.forEach(function(uuid) {
                $HUB.call('repos', 'one', {
                    id: uuid
                }, function(err, repo) {
                    $scope.loaded = ++count === repos.length;
                    if(!err) {
                        $scope.repos.push(repo.value);
                    }
                });
            });
        });

        $scope.auth = $RPC.call('user', 'authorization');

        //
        // Actions
        //

        $scope.add = function(repo) {
            $RPC.call('user', 'addRepo', {
                user: repo.owner.login,
                repo: repo.name,
                repo_uuid: repo.id
            }, function(err) {
                $scope.active = null;
                if(!err) {
                    repo.adddate = -new Date();
                    $scope.repos.push(repo);
                    $rootScope.user.value.repos.push(repo.id);

                    $scope.search = '';
                    $scope.show = false;
                }
            });
        };

        $scope.rmv = function(repo) {
            if(repo.permissions.admin) {
                $scope.active = $scope.active !== repo ? repo : null;
            } else {
                $scope.remove(repo);
            }
        };

        $scope.remove = function(repo) {
            var i = $scope.repos.indexOf(repo);
            var j = $rootScope.user.value.repos.indexOf(repo.id);
            $RPC.call('user', 'rmvRepo', {
                user: repo.owner.login,
                repo: repo.name,
                repo_uuid: repo.id
            }, function(err) {
                if(!err) {
                    $scope.repos.splice(i, 1);
                    $rootScope.user.value.repos.splice(j, 1);
                    $scope.active = null;
                }
            });
        };

        $scope.removeWebhook = function(repo) {
            $scope.webhook = $RPC.call('webhook', 'remove', {
                user: repo.owner.login,
                repo: repo.name
            }, function(err) {
                if(!err) {
                    $scope.remove(repo);
                }
            });
        };

        $scope.createOnboardingRepo = function() {
            $scope.repoLoading = $RPC.call('onboard', 'createrepo', {}, function(err, repo) {
                if (!err) {
                    $scope.add(repo.value, function(err) {
                        if (!err) {
                            var repoToAdd = repo.value;
                            repoToAdd.adddate = -new Date();
                            $scope.repos.push(repoToAdd);
                        }
                    });
                    $rootScope.dismiss('welcome');
                }
            });
        };

        //
        // Helper functions
        //

        $scope.contains = function(id) {
            var contains = false;
            $scope.repos.forEach(function(repo) {
                contains = contains || repo.id === id;
            });

            return contains;
        };
    }
]);
