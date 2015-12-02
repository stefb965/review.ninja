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

        $scope.settings = $RPC.call('settings', 'get', {
            repo_uuid: repo.value.id
        });

        $scope.threshold = 1;
        $scope.comment = true;

        $scope.reposettings = $RPC.call('repo', 'get', {
            repo_uuid: repo.value.id
        });

        $scope.slack = $RPC.call('repo', 'getSlack', {
            repo_uuid: repo.value.id
        });

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

        $scope.changeThreshold = function() {
            $RPC.call('repo', 'setThreshold', {
                repo_uuid: repo.value.id,
                user: $stateParams.user,
                repo: $stateParams.repo,
                threshold: $scope.reposettings.value.threshold
            }, function(err, settings) {
                if(!err) {
                    $scope.reposettings.value.threshold = settings.value.threshold;
                }
            });
        };

        $scope.toggleComments = function() {
            $RPC.call('repo', 'setComment', {
                repo_uuid: repo.value.id,
                comment: $scope.reposettings.value.comment
            }, function(err, settings) {
                if(!err) {
                    $scope.reposettings.value.comment = settings.value.comment;
                }
            });
        };

        $scope.setSlack = function() {
            $RPC.call('repo', 'setSlack', {
                repo_uuid: repo.value.id,
                slack: $scope.reposettings.value.slack
            }, function(err, settings) {
                if(!err) {
                    $scope.slack.value.token = 'true';
                    $scope.reposettings.value.slack = settings.value.slack;
                }
            });
        };

        $scope.teams = $HUB.call('orgs', 'getTeams', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            org: repo.value.organization.login
        });

        $scope.changeTeamThreshold = function() {
          console.log('Setting team threshold %d',  $scope.reposettings.value.required.threshold);
          console.log('Setting team %s',  $scope.reposettings.value.required.team.name);

            /*$RPC.call('repo', 'setTeamThreshold', {
                repo_uuid: repo.value.id,
                user: $stateParams.user,
                repo: $stateParams.repo,
                required: $scope.reposettings.value.required.threshold,
                team: $scope.reposettings.value.required.team,
            }, function(err, settings) {
                if(!err) {
                    $scope.reposettings.value.required.threshold, = settings.value.threshold;
                    $scope.reposettings.value.required.team = settings.value.team;
                }
            });*/
        };

    }]);
