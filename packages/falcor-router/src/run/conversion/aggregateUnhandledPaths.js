module.exports = aggregateUnhandledPaths;

function aggregateUnhandledPaths(memo, next) {

    var unhandled = memo.unhandled;

    if (next) {
        var nextUnhandled = next.unhandled;
        if (nextUnhandled && nextUnhandled.length) {
            !unhandled && (unhandled = nextUnhandled) ||
            (unhandled.push.apply(unhandled, nextUnhandled));
        }
        next.unhandled = unhandled;
        return next;
    }

    return memo;
}
