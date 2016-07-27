'use strict';

// *****************************************************
// Pull Request Controller
//
// tmpl: pull/pull.html
// path: /:user/:repo/pull/:number
// resolve: repo, pull
// *****************************************************

module.controller('PullCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$modal',
    '$filter',
    '$location',
    '$anchorScroll',
    '$HUB',
    '$RPC',
    'Pull',
    'Markdown',
    'Reference',
    'Comment',
    'Extra',
    'repo',
    'pull',
    'socket',
    function($scope, $rootScope, $state, $stateParams, $modal, $filter, $location, $anchorScroll, $HUB, $RPC, Pull, Markdown, Reference, Comment, Extra, repo, pull, socket) {

        //
        // HACK?
        //

        if($state.current.name === 'repo.pull') {
            $state.go('.review.reviewList', {base: pull.value.base.sha, head: pull.value.head.sha});
        }

        // set the states
        $scope.state = 'open';

        $scope.repo = repo.value;

        // get the pull request
        $scope.pull = Pull.status(pull.value) && Pull.stars(pull.value, true) && Markdown.render(pull.value);

        // get the combined statuses
        $scope.status = $HUB.call('repos', 'getCombinedStatus', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            sha: $scope.pull.head.sha
        });

        // get the repository settings for threshold
        $scope.reposettings = $RPC.call('repo', 'get', {
            repo_uuid: repo.value.id
        });

        // get the pull req comments
        $scope.conversation = $HUB.call('issues', 'getComments', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            number: $stateParams.number
        }, function(err, comments) {
            if(!err) {
                comments.affix.forEach(function(comment) {
                    comment = Markdown.render(comment);
                });
            }
        });

        // get review comments
        $scope.review = $HUB.call('pullRequests', 'getComments', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            number: $stateParams.number,
            per_page: 100
        }, function(err, comments) {
            if(!err) {
                comments = Comment.thread(comments);
                comments.affix.forEach(function(comment) {
                    comment = Comment.review(comment) && Markdown.render(comment);
                });

                if($state.params.ref && !comments.thread[$state.params.ref]) {
                    $state.go('repo.pull.review.reviewList');
                }
            }
        });

        // get the collaborators
        $scope.collaborators = Extra.collaborators($stateParams.user, $stateParams.repo);

        // get the branch
        $scope.branch = $HUB.call('repos', 'getBranch', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            branch: pull.value.base.ref,
            headers: {'Accept': 'application/vnd.github.loki-preview+json'}
        });

        $scope.comment = {};
        $scope.reviewComment = {};


        //
        // Messages
        //

        $scope.$on('compareCommits', function(event, comp) {
            $scope.comp = comp;
        });


        //
        // Actions
        //

        $scope.setStar = function() {

            var fn = $scope.pull.star ? 'rmv' : 'set';

            $RPC.call('star', fn, {
                repo: $stateParams.repo,
                user: $stateParams.user,
                sha: $scope.pull.head.sha,
                number: $scope.pull.number,
                repo_uuid: $scope.pull.base.repo.id
            });
        };

        $scope.setPref = function(key, val) {
            $RPC.call('user', 'setPref', {
                key: key,
                val: val
            }, function(err, user) {
                if(!err) {
                    $rootScope.user.value.prefs = user.value.prefs;
                }
            });
        };

        $scope.addReviewComment = function(comment, ref) {
            if(comment && comment.body) {

                ref = $scope.review.thread[ref] ? $scope.review.thread[ref].add : Reference.parse(ref);

                $scope.reviewing = $HUB.call('pullRequests', 'createComment', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: $stateParams.number,
                    body: comment.body,
                    commit_id: ref.sha,
                    path: ref.path,
                    position: ref.position
                }, function(err, c) {
                    if(!err) {
                        comment.body = '';
                        comment.html = '';
                        $scope.review.value.push(Comment.review(c.value) && Markdown.render(c.value));
                    }
                });
            }
        };

        var updateComment = function(comment, obj, fun) {
            if(comment && comment.body) {
                $HUB.call(obj, fun, {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    id: comment.id,
                    number: comment.id,
                    body: comment.body
                }, function(err, c) {
                    if(!err) {
                        Markdown.html(c.value.body, function(html) {
                            comment.edit = false;
                            comment.html = html;
                        });
                    }
                });
            }
        };

        $scope.updateReviewComment = function(comment) {
            updateComment(comment, 'pullRequests', 'editComment');
        };

        $scope.updateIssueComment = function(comment) {
            updateComment(comment, 'issues', 'editComment');
        };

        $scope.addComment = function(comment) {
            if(comment && comment.body) {
                $scope.commenting = $HUB.wrap('issues', 'createComment', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: $stateParams.number,
                    body: comment.body
                }, function(err, c) {
                    if(!err) {
                        comment.body = '';
                        comment.html = '';
                        $scope.conversation.value.push(Markdown.render(c.value));
                    }
                });
            }
        };

        $scope.preview = function(comment) {
            comment.html = comment.html ? null : Markdown.render(comment).html;
        };

        $scope.assign = function(collaborator) {
            $scope.assigning = $HUB.call('issues', 'edit', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                number: $stateParams.number,
                assignee: collaborator
            }, function(err, pull) {
                if(!err) {
                    $scope.pull.assignee = pull.value.assignee;
                }
            });
        };

        $scope.scrollTo = function(anchor) {
            $location.hash(anchor);
            $anchorScroll();
            $location.hash(null);
        };


        //
        // Modals
        //

        $scope.badge = function() {
            var modal = $modal.open({
                templateUrl: '/modals/templates/badge.html',
                controller: 'BadgeCtrl'
            });
        };

        //
        // Websockets
        //

        socket.on($stateParams.user + ':' + $stateParams.repo + ':' + 'status', function(args) {
            if($scope.pull.head.sha === args.sha) {
                $HUB.call('repos', 'getCombinedStatus', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    sha: $scope.pull.head.sha
                }, function(err, status) {
                    if(!err) {
                        $scope.status.value = status.value;
                        $scope.pull = Pull.status(pull.value);
                    }
                });
            }
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':' + 'pull_request', function(args) {
            if($scope.pull.number === args.number) {

                if(args.action === 'synchronize' && args.head !== $scope.pull.head) {
                    $state.go('.', {base: args.base, head: args.head}, {reload: true});
                }

                $HUB.call('pullRequests', 'get', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: $stateParams.number
                }, function(err, pull) {
                    if(!err) {
                        angular.extend($scope.pull, pull.value);
                    }
                });
            }
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':' + 'pull_request_star', function(args) {
            if($scope.pull.number === args.number) {
                $scope.pull = Pull.stars($scope.pull, true);
            }
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':' + 'pull_request_review_comment', function(args) {
            if($scope.pull.number === args.number) {
                $HUB.call('pullRequests', 'getComment', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: args.id
                }, function(err, comment) {
                    if(!err) {
                        $scope.review.value.push(Comment.review(comment.value) && Markdown.render(comment.value));
                    }
                });
            }
        });

        socket.on($stateParams.user + ':' + $stateParams.repo + ':' + 'issue_comment', function(args) {
            if($scope.pull.number === args.number && args.action === 'created') {
                $HUB.call('issues', 'getComment', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    id: args.id
                }, function(err, comment) {
                    if(!err) {
                        $scope.conversation.value.push(Markdown.render(comment.value));
                    }
                });
            }
        });
    }
]);
