'use strict';
// *****************************************************
// File Factory
// *****************************************************

module.factory('File', ['$HUB', '$stateParams', function($HUB, $stateParams) {

    var images = ['jpg', 'jpeg', 'png', 'bmp', 'psd', 'tiff', 'ico'];

    var isImage = function(filename) {
        var ext = filename.split('.').pop().toLowerCase();
        return images.indexOf(ext) !== -1 ? true : false;
    };

    return {
        getTreeTypes: function(tree) {
            tree.tree.forEach(function(node) {
                if(node.type === 'blob' && isImage(node.path)) {
                    node.type = 'image';
                }
            });
            return tree;
        },

        getFileTypes: function(files) {
            files.forEach(function(file) {
                if(isImage(file.filename)) {
                    file.image = file.raw_url;
                }
            });
            return files;
        },

        getLineNumbs: function(files) {
            var numbs = {};
            files.forEach(function(file) {
                numbs[file.filename] = {};
                file.patch.forEach(function(line) {
                    numbs[file.filename][line.position] = {head: line.head, base: line.base};
                });
            });
            return numbs;
        },

        getSplitView: function(files) {
            files.forEach(function(file) {

                file.split = [];

                for(var i = 0; i < file.patch.length; i++) {

                    var line = file.patch[i];

                    var base = null, head = null;


                    if(line.ignore) {
                        continue;
                    }

                    if(line.chunk) {
                        base = line;
                    }

                    if(line.del) {
                        base = line;

                        var j = i + 1;

                        while(j < file.patch.length - 1 && (file.patch[j].del || file.patch[j].ignore)) {
                            j++;
                        }

                        if(file.patch[j].add) {
                            head = file.patch[j];
                            file.patch[j].ignore = true;
                        }
                    }

                    if(line.add) {
                        head = line;
                    }

                    if(line.normal) {
                        base = line;
                        head = line;
                    }

                    file.split.push({base: base, head: head});
                }
            });
            return files;
        }
    };
}]);
