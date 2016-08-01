'use strict';

// *****************************************************
// Pull Factory
// *****************************************************

module.factory('Pull', ['$HUB', '$RPC', '$stateParams', '$rootScope', function($HUB, $RPC, $stateParams, $rootScope) {

    return {

        stars: function(pull, avatar) {
            $RPC.call('star', 'all', {
                sha: pull.head.sha,
                repo_uuid: pull.base.repo.id
            }, function(err, stars) {
                if(!err) {
                    pull.star = null;
                    pull.stars = stars.value;

                    pull.stars.forEach(function(star) {
                        $rootScope.promise.then(function(user) {
                            if(star.name === user.value.login) {
                                pull.star = star;
                            }
                        });
                        if(avatar) {
                            star.user = $HUB.call('users', 'getForUser', {
                                user: star.name
                            });
                        }
                    });
                }
            });
            return pull;
        },

        status: function(pull) {
            $RPC.call('status', 'get', {
                sha: pull.head.sha,
                user: $stateParams.user,
                repo: $stateParams.repo,
                number: pull.number,
                repo_uuid: pull.base.repo.id
            }, function(err, status) {
                if(!err) {
                    pull.status = status.value;
                }
            });
            return pull;
        },

        commentsCount: function(pull) {
            $HUB.call('issues', 'getComments', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                number: pull.number,
                per_page: 10
            }, function(err, comments) {
                if(!err) {
                    pull.commentsCount = comments.value.length < 10 ? comments.value.length : comments.value.length + '+';
                }
            });
            return pull;
        }
    };
}]);
