'use strict';

// *****************************************************
// Comment Factory
// *****************************************************

module.factory('Comment', ['Reference', 'Markdown', function(Reference, Markdown) {

    var thread = {};

    var status = function(comment) {

        var state, label;

        var negative = /\!\bfix\b|\!\bresolve\b/g;
        var positive = /\!\bfixed\b|\!\bresolved\b|\!\bcompleted\b/g;

        negative = comment.body.match(negative);
        positive = comment.body.match(positive);

        if(negative) {
            state = 'open';
            label = negative[0];
        } else if(positive && !negative) {
            state = 'closed';
            label = positive[0];
        }

        return {state: state, label: label};
    };

    return {

        thread: function(comments) {
            thread = comments.thread = comments.thread || {};
            return comments;
        },

        review: function(comment) {

            var curr = {sha: comment.commit_id, path: comment.path, position: comment.position};
            var orig = {sha: comment.original_commit_id, path: comment.path, position: comment.original_position};

            var ref = comment.commit_id && comment.position ? curr : orig;
            var str = Reference.get(ref.sha, ref.path, ref.position);

            thread[str] = thread[str] || Markdown.render({
                sha: ref.sha,
                add: orig,
                path: ref.path,
                file: ref.path.split('/').pop(),
                body: comment.body,
                author: comment.user.login,
                avatar: comment.user.avatar_url,
                state: 'none',
                label: 'Add status',
                anchor: Reference.anchor(ref.sha, ref.path, ref.position),
                position: ref.position,
                comments: []
            });

            thread[str].comments.push(comment);
            thread[str].last_updated = comment.created_at;

            var data = status(comment);
            thread[str].state = data.state || thread[str].state;
            thread[str].label = data.label || thread[str].label;

            return comment;
        }
    };
}]);
