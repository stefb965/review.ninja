'use strict';
// *****************************************************
// Merge Directive
// *****************************************************

module.directive('mergeButton', ['$HUB', '$stateParams', '$rootScope', '$timeout', '$filter', function($HUB, $stateParams, $rootScope, $timeout, $filter) {
    return {
        restrict: 'E',
        templateUrl: '/directives/templates/merge.html',
        scope: {
            repo: '=',
            pull: '=',
            status: '=',
            protection: '=',
            permissions: '=',
            reposettings: '='
        },
        link: function(scope, elem, attrs) {

            scope.$config = $rootScope.$config;

            var text = {
                failure: 'failed',
                pending: 'pending',
                success: 'succeeded'
            };

            if(scope.permissions.push && scope.pull.base.repo.id === scope.pull.head.repo.id) {
                scope.branch = $HUB.call('repos', 'getBranch', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    branch: scope.pull.head.ref,
                    headers: {'Accept': 'application/vnd.github.loki-preview+json'}
                });
            }

            if(scope.repo.organization) {
                scope.teams = $HUB.call('orgs', 'getTeams', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    org: $stateParams.user
                }, function(err, teams) {
                  if(!err) {
                      teams.value.forEach(function(team) {
                        if(team.id === scope.reposettings.value.reviewers) {
                            scope.reviewTeam = team;
                        }
                      });
                  }
                });
            }

            scope.$watch('status', function(status) {
                var state = status ? status.state : null;
                if(state) {
                    scope.status.count = 0;
                    scope.status.text = text[state];
                    scope.status.statuses.forEach(function(status) {
                        if(status.state === state) {
                            scope.status.count++;
                        }
                        // Count error statuses as 'failed' when combined status is 'failure'
                        if(status.state === 'failure' && status === 'errored') {
                            scope.status.count++;
                        }
                    });
                }

                // the default status
                scope.status = scope.status || {
                    state: 'pending',
                    statuses: []
                };
            });

            scope.$watch('status + permissions + protection', function() {
                if(scope.status && scope.permissions && scope.protection) {
                    scope.required = {};
                    scope.required.pass = true;
                    scope.required.over = scope.protection.required_status_checks.enforcement_level === 'non_admins' && scope.permissions.admin;
                    scope.status.statuses.forEach(function(status) {
                        if(status.state !== 'success' && scope.protection.required_status_checks.contexts.indexOf(status.context) > -1) {
                            scope.required.pass = false;
                        }
                    });
                }
            });

            scope.deleteBranch = function() {
                scope.showConfirmation = false;
                $HUB.call('gitdata', 'deleteReference', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    ref: 'heads/' + scope.pull.head.ref
                }, function(err, result) {
                    if(!err) {
                        scope.branch = null;
                        scope.branchRemoved = true;
                    }
                });
            };

            scope.merge = function(squash) {
                scope.merging = $HUB.call('pullRequests', 'merge', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: $stateParams.number,
                    squash: squash,
                    headers: {'Accept': 'application/vnd.github.polaris-preview+json'}
                });
            };

            //
            // Helper funtion
            //

            scope.reviewers = function(star) {
                return star.reviewer !== false;
            };

            scope.confirm = function() {
                scope.showConfirmation = true;
                $timeout(function() {
                    scope.showConfirmation = false;
                }, 10000);
            };
        }
    };
}]);
