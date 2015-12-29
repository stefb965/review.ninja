'use strict';
// *****************************************************
// Settings Controller
//
// tmpl: settings.html
// path: /:user/:repo/settings
// resolve: repo
// *****************************************************

module.controller('SettingsCtrl', ['$scope', '$stateParams', '$HUB', '$RPC', '$modal', 'repo',
    function($scope, $stateParams, $HUB, $RPC, $modal, repo) {

        $scope.repo = repo;

        $scope.threshold = 1;
        $scope.comment = true;
        $scope.reviewTeam = null;

        $scope.settings = $RPC.call('settings', 'get', {
            repo_uuid: repo.value.id
        });

        $scope.repoSettings = $RPC.call('repo', 'get', {
            repo_uuid: repo.value.id
        });

        $scope.slack = $RPC.call('slack', 'get', {
            repo_uuid: repo.value.id
        }, function(err, slack) {
            if(!err) {
                slack.value.token = $RPC.call('slack', 'token', {
                    repo_uuid: repo.value.id
                });
            }
        });

        if(repo.value.organization) {
            $scope.teams = $HUB.call('orgs', 'getTeams', {
              user: $stateParams.user,
              repo: $stateParams.repo,
              org: repo.value.organization.login
          });
        }

        //
        // Watches
        //

        $scope.$watch('teams.value + repoSettings.value.reviewers', function() {
            if($scope.teams && $scope.teams.value && $scope.repoSettings.value) {
                $scope.reviewTeam = null;
                $scope.teams.value.forEach(function(team) {
                    if(team.id === $scope.repoSettings.value.reviewers) {
                        $scope.reviewTeam = team;
                    }
                });
            }
        });


        //
        // Actions
        //

        $scope.setNotifications = function() {
            $RPC.call('settings', 'setNotifications', {
                repo_uuid: repo.value.id,
                notifications: $scope.settings.value.notifications
            }, function(err, settings) {
                if(!err) {
                    $scope.settings.value.notifications = settings.value.notifications;
                }
            });
        };

        $scope.setWatched = function(watched) {
            $RPC.call('settings', 'setWatched', {
                repo_uuid: repo.value.id,
                watched: watched
            }, function(err, settings) {
                if(!err) {
                    $scope.newWatch = '';
                    $scope.settings = settings;
                }
            });
        };

        $scope.addWatch = function() {
            var watched = $scope.settings.value.watched;
            watched.unshift($scope.newWatch);
            $scope.setWatched(watched);
        };

        $scope.removeWatch = function(watch) {
            var watched = $scope.settings.value.watched;
            watched.splice(watched.indexOf(watch), 1);
            $scope.setWatched(watched);
        };

        $scope.setRepo = function(args) {
            args.repo_uuid = repo.value.id;
            $RPC.call('repo', 'set', args, function(err, repo) {
                if(!err) {
                    $scope.repoSettings.value = repo.value;
                }
            });
        };

        $scope.setSlack = function(args) {
            args.repo_uuid = repo.value.id;
            $RPC.call('slack', 'set', args, function(err, slack) {
                if(!err) {
                    $scope.slack.value = slack.value;
                    $scope.slack.value.token = {value: true};
                }
            });
        };

    }]);
