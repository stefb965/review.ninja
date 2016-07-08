'use strict';

// *****************************************************
// Truncate Directive
// *****************************************************

module.directive('truncate', function() {
    return {
        restrict: 'A',
        scope: {
            truncate: '='
        },
        link: function(scope, element, attr) {
            var length = attr.length || 50;
            scope.$watch('truncate', function(value) {
                element.html($.truncate(value, {length: length}));
            });
        }
    };
});
