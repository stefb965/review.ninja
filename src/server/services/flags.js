'use strict';

var reference = function(sha, path, position) {
    return sha + '/' + path + 'R' + position;
};

module.exports = {

    review: function(comments) {

        // TODO: enhance to parse markdown lists e.g. [] -> [ ]

        var threads = {};

        var open = 0;
        var closed = 0;

        var negative = /\!\bfix\b|\!\bresolve\b/g;
        var positive = /\!\bfixed\b|\!\bresolved\b|\!\bcompleted\b/g;
        var listNeg = /- \[ \]/g;

        comments.forEach(function(comment) {
            var ref = reference(comment.original_commit_id, comment.path, comment.original_position);
            threads[ref] = threads[ref] || [];
            threads[ref].push(comment);
        });

        for(var ref in threads) {

            var state = null;

            for(var i = 0; i < threads[ref].length; i++) {
                if (threads[ref][i].body.match(listNeg) && threads[ref][i].body.match(negative)) {
                  state = 'open';
                  break;
                }

                var neg = threads[ref][i].body.match(negative);
                var pos = threads[ref][i].body.match(positive);

                if(neg) {
                    state = 'open';
                } else if(pos && !neg) {
                    state = 'closed';
                }
            }

            open = state === 'open' ? open + 1 : open;
            closed = state === 'closed' ? closed + 1 : closed;
        }

        return {open: open, closed: closed, total: open + closed};
    },

    star: function(comment) {
        var starRegex = /\!star|\!ninjastar|\+1|\:thumbsup\:|\:star\:/g;
        return !!comment.match(starRegex);
    },

    unstar: function(comment) {
        var unstarRegex = /\!unstar|\-1|\:thumbsdown\:/g;
        return !!comment.match(unstarRegex);
    }

};
