var noteToJsongOrPV = require('../conversion/noteToJsongOrPV');

module.exports = noteToMatchAndResult;

function noteToMatchAndResult(matchAndPath, optimized, isCall) {
    return function(note) {
        return {
            match: matchAndPath.match,
            optimized: optimized || matchAndPath.path,
            value: noteToJsongOrPV(matchAndPath.path, note, isCall)
        };
    }
}
