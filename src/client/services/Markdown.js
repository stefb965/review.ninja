'use strict';

// *****************************************************
// Markdown Factory
// *****************************************************

module.factory('Markdown', ['$HUB', '$stateParams', function($HUB, $stateParams) {

    var label = function(markdown) {

        var negative = /\!\bfix\b|\!\bresolve\b/g;
        var positive = /\!\bfixed\b|\!\bresolved\b|\!\bcompleted\b/g;
        var star = /\!\bstar\b|\!\bninjastar\b|\blp?gtm\b/gi;
        var unstar = /\!\bunstar\b/;

        markdown = markdown.replace(negative, function(flag) {
            return '<span class="label label-warning">' + flag + '</span>';
        });

        markdown = markdown.replace(positive, function(flag) {
            return '<span class="label label-primary">' + flag + '</span>';
        });

        markdown = markdown.replace(star, function(flag) {
            return '<span class="label label-primary">' + flag + '</span>';
        });

        markdown = markdown.replace(unstar, function(flag) {
            return '<span class="label label-primary muted">' + flag + '</span>';
        });

        return markdown;
    };

    return {
        render: function(obj) {
            if(obj.body) {
                $HUB.call('misc', 'renderMarkdown', {
                    text: obj.body,
                    mode: 'gfm',
                    context: $stateParams.user + '/' + $stateParams.repo
                }, function(err, markdown) {
                    if(!err) {
                        obj.html = label(markdown.value.data);
                    }
                });
            }

            return obj;
        },

        html: function(body, call) {
            $HUB.call('misc', 'renderMarkdown', {
                text: body,
                mode: 'gfm',
                context: $stateParams.user + '/' + $stateParams.repo
            }, function(err, markdown) {
                var html = err ? null : label(markdown.value.data);
                call(html);
            });
        }
    };
}]);
