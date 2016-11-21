var onNext = 'N';
var isJSONG = require('./../../support/isJSONG');
var errorToPathValue = require('./errorToPathValue');
var MaxPathsExceededError = require('./../../errors/MaxPathsExceededError');
var CallRequiresPathsError = require('./../../errors/CallRequiresPathsError');

/**
 * Takes a path and for every onNext / onError it will attempt
 * to pluck the value or error from the note and process it
 * with the path object passed in.
 * @param {PathSet|PathSet[]} pathOrPathSet -
 * @param {Boolean} isPathSet -
 */
module.exports = noteToJsongOrPV;

function noteToJsongOrPV(pathSet, note, isCall) {
    var incomingJSONGOrPathValues;
    var kind = note.kind;
    var error;

    // Take what comes out of the function and assume its either a pathValue or
    // jsonGraph.
    if (kind === onNext) {
        if (!(incomingJSONGOrPathValues = note.value)) {
            return incomingJSONGOrPathValues;
        }
    }

    // Convert the error to a pathValue.
    else {
        error = note.error;
        if (isCall || error instanceof MaxPathsExceededError) {
            throw error;
        }
        incomingJSONGOrPathValues = errorToPathValue(note.error, pathSet);
    }

    // If its jsong we may need to optionally attach the
    // paths if the paths do not exist
    if (isJSONG(incomingJSONGOrPathValues) && !incomingJSONGOrPathValues.paths) {
        if (isCall) {
            throw new CallRequiresPathsError();
        }
        incomingJSONGOrPathValues = {
            paths: [pathSet],
            jsonGraph: incomingJSONGOrPathValues.jsonGraph
        };
    }

    return incomingJSONGOrPathValues;
}
