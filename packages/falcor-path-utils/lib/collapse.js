var toPaths = require('./toPaths');
var toCollapseMap = require('./toCollapseMap');
var toCollapseTrees = require('./toCollapseTrees');

module.exports = function collapse(paths) {
    return toPaths(toCollapseTrees(toCollapseMap(paths)));
};
