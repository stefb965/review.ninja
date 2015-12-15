'use strict';

var module = angular.module('app',
    ['ninja.config',
     'ninja.filters',
     'ui.utils',
     'ui.router',
     'ui.bootstrap',
     'infinite-scroll',
     'ngSanitize',
     'angulartics',
     'angulartics.google.analytics',
     'angular.filter']);

var filters = angular.module('ninja.filters', []);

// *************************************************************
// Delay start
// *************************************************************

angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
});

// *************************************************************
// States
// *************************************************************

module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', '$configProvider', '$analyticsProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $configProvider, $analyticsProvider) {

        $stateProvider

            //
            // Home state
            //
            .state('home', {
                url: '/?addrepo',
                templateUrl: '/templates/home.html',
                controller: 'HomeCtrl'
            })

            //
            // Repo state (abstract)
            //
            .state('repo', {
                abstract: true,
                url: '/:user/:repo',
                templateUrl: '/templates/base.html',
                resolve: {
                    repo: ['$rootScope', '$stateParams', '$HUBService', '$RPC',
                        function($rootScope, $stateParams, $HUBService, $RPC) {
                            return $HUBService.call('repos', 'get', {
                                user: $stateParams.user,
                                repo: $stateParams.repo
                            }, function(err, repo) {
                                if(!err && repo.value.permissions.admin) {
                                    $rootScope.repo_uuid = repo.value.id;
                                    $rootScope.token = $RPC.call('repo', 'token', {
                                        user: $stateParams.user,
                                        repo: $stateParams.repo,
                                        repo_uuid: repo.value.id
                                    });
                                    $rootScope.webhook = $RPC.call('repo', 'webhook', {
                                        user: $stateParams.user,
                                        repo: $stateParams.repo,
                                        repo_uuid: repo.value.id
                                    });
                                }
                            });
                        }
                    ]
                }
            })

            //
            // Repo master state (list of pull requests)
            //
            .state('repo.master', {
                url: '',
                templateUrl: '/templates/repo.html',
                controller: 'RepoCtrl',
                resolve: {
                    repo: ['repo', function(repo) {
                        return repo; // inherited from parent state
                    }]
                }
            })

            //
            // Repo settings state
            //
            .state('repo.settings', {
                url: '/settings',
                templateUrl: '/templates/settings.html',
                controller: 'SettingsCtrl',
                resolve: {
                    repo: ['repo', function(repo) {
                        return repo; // inherited from parent state
                    }]
                }
            })

            //
            // Pull request state (abstract)
            //
            .state('repo.pull', {
                url: '/pull/:number',
                templateUrl: '/templates/pull.html',
                controller: 'PullCtrl',
                resolve: {
                    repo: ['repo', function(repo) {
                        return repo; // inherited from parent state
                    }],
                    pull: ['$stateParams', '$HUBService',
                        function($stateParams, $HUBService) {
                            return $HUBService.call('pullRequests', 'get', {
                                user: $stateParams.user,
                                repo: $stateParams.repo,
                                number: $stateParams.number
                            });
                        }
                    ]
                }
            })

            //
            // Pull request review comments parent
            //
            .state('repo.pull.review', {
                abstract: true,
                url: '/{base:[0-9a-fA-F]{40}}...{head:[0-9a-fA-F]{40}}',
                template: '<section ui-view></section>',
                controller: 'ReviewCtrl'
            })

            //
            // Pull request review comments state
            //
            .state('repo.pull.review.reviewList', {
                url: '?conversation',
                templateUrl: '/templates/reviewList.html',
                reloadOnSearch: false
            })

            //
            // Pull request review comment detail state
            //
            .state('repo.pull.review.reviewItem', {
                url: '/*ref',
                templateUrl: '/templates/reviewItem.html'
            })

            //
            // 404 Error page
            //
            .state('error', {
                templateUrl: '/templates/error/not-found.html'
            });

        $urlRouterProvider.otherwise('/');

        $locationProvider.html5Mode(true);

        $analyticsProvider.firstPageview(true);
        $analyticsProvider.withAutoBase(true);

        $logProvider.debugEnabled($configProvider.log);
    }
])
.run(['$config', '$rootScope', '$state', '$stateParams',
    function($config, $rootScope, $state, $stateParams) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $config.get(function(data, status) {
            $rootScope.$config = data;
            if(data.gacode) {
                ga('create', data.gacode, 'auto');
            }
        });
    }
]);
