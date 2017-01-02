var normalizedToken = {};
var isArray = Array.isArray;
var Observable = require('../../rx').Observable;
var isJSONG = require('./../../support/isJSONG');
var isMessage = require('./../../support/isMessage');
var isPathValue = require('./../../support/isPathValue');

module.exports = flattenAndNormalizeActionResults;

function flattenAndNormalizeActionResults(result) {
    var match = result.match;
    var optimized = result.optimized;
    return Observable
        .of(result.value)
        .expand(flattenAndNormalizeActionOutput(match, optimized))
        .filter(isNormalizedResult)
        .map(mapNormalizedResults)
        .toArray()
        .map(function (value) {
            return { value: value, match: match };
        });
}

function isNormalizedResult(xs) {
    return xs && (
        isMessage(xs) ||
        xs.normalizedToken === normalizedToken
    );
}

function mapNormalizedResults(xs) {
    return xs.normalizedResult || xs;
}

function flattenAndNormalizeActionOutput(match, optimized) {

    optimized = optimized || [];

    function normalizePath(path) {
        if (!path) {
            return optimized.slice(0);
        } else if (path.length >= optimized.length) {
            return path;
        } else {
            return optimized.slice(
                0, optimized.length - path.length
            ).concat(path);
        }
    }

    return function normalizeActionOutput(value) {

        if (isArray(value)) {
            return value;
        }
        else if (!value || isNormalizedResult(value)) {
            return Observable.empty();
        }
        else if (isJSONG(value)) {
            if (value.relative === true)  {
                value.paths = value.paths.map(normalizePath);
            }
            return [{
                normalizedResult: value,
                normalizedToken: normalizedToken
            }];
        }
        else if (isPathValue(value)) {
            if (value.relative === true && !value.invalidated) {
                value.path = normalizePath(value.path);
            }
            return [{
                normalizedResult: value,
                normalizedToken: normalizedToken
            }];
        }
        return [];
        // else {
        //     return [{
        //         normalizedToken: normalizedToken,
        //         normalizedResult: {
        //             value: value,
        //             path: normalizePath()
        //         }
        //     }];
        // }
    };
}
