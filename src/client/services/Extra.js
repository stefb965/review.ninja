'use strict';

// *****************************************************
// Extra Factory
// *****************************************************

module.factory('Extra', ['$HUB', function($HUB) {

    var user, repo, collaborators;

    var emojis = $HUB.call('misc', 'getEmojis');

    var flags = [
        {
            label: 'fix',
            type: 'review',
            icon: '<i class="fa fa-exclamation text-warning"></i>'
        },
        {
            label: 'resolve',
            type: 'review',
            icon: '<i class="fa fa-exclamation text-warning"></i>'
        },
        {
            label: 'fixed',
            type: 'review',
            icon: '<i class="fa fa-check text-primary"></i>'
        },
        {
            label: 'resolved',
            type: 'review',
            icon: '<i class="fa fa-check text-primary"></i>'
        },
        {
            label: 'completed',
            type: 'review',
            icon: '<i class="fa fa-check text-primary"></i>'
        },
        {
            label: 'star',
            type: 'star',
            icon: '<span class="icon-ninja-star text-primary"></i>'
        },
        {
            label: 'ninjastar',
            type: 'star',
            icon: '<span class="icon-ninja-star text-primary"></i>'
        },
        {
            label: 'unstar',
            type: 'star',
            icon: '<span class="icon-ninja-star text-primary muted"></i>'
        }
    ];

    return {

        flags: function(type) {
            return $.map(flags, function(flag) {
                return type === flag.type ? flag : null;
            });
        },

        emojis: function() {
            return emojis;
        },

        collaborators: function(_user, _repo) {
            collaborators = user === _user && repo === _repo ? collaborators : $HUB.call('repos', 'getCollaborators', {
                user: _user,
                repo: _repo
            });

            user = _user;
            repo = _repo;

            return collaborators;
        }
    };
}]);
