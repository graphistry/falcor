module.exports = aggregateJSONGraphPaths;

function aggregateJSONGraphPaths(memo, next) {

    var paths = memo.paths;
    var invalidated = memo.invalidated;

    if (next) {
        var nextPaths = next.paths;
        var nextInvalidated = next.invalidated;
        if (nextPaths && nextPaths.length) {
            !paths && (paths = nextPaths) ||
            (paths.push.apply(paths, nextPaths));
        }
        if (nextInvalidated && nextInvalidated.length) {
            !invalidated && (invalidated = nextInvalidated) ||
            (invalidated.push.apply(invalidated, nextInvalidated));
        }
        next.paths = paths;
        next.invalidated = invalidated;
        return next;
    }

    return memo;
}
