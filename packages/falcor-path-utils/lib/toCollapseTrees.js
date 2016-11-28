var toTree = require('./toTree');

module.exports = toCollapseTrees;

function toCollapseTrees(collapseMap, collapseTrees) {
    return Object.keys(collapseMap).reduce(function(collapseTrees, collapseKey) {
        collapseTrees[collapseKey] = toTree(
            collapseMap[collapseKey],
            collapseTrees[collapseKey]
        );
        return collapseTrees;
    }, collapseTrees || {});
}
