var $atom = require('./../../../src/support/types').$atom;
module.exports = function() {
    var retVal = {
        state: generateState,
        summary: generateSummary,
        Summary: {
            paths: [['videos', 'summary']],
            jsonGraph: {
                videos: {
                    summary: {
                        $type: $atom,
                        value: 75
                    }
                }
            }
        }
    };
    [0, 1, 2, 'someKey'].forEach(function(key) {
        retVal[key] = {
            summary: generateSummary(key),
            missingSummary: generateMissingSummary(key)
        };
    });
    retVal.state = {};
    [0, 1, 2, 'specificKey'].forEach(function(key) {
        retVal.state[key] = generateState(key);
    });
    return retVal;
};

module.exports.state = generateState;
module.exports.summary = generateSummary;

function generateSummary(id) {
    var videos = {};
    videos[id] = {
        summary: 'Some Movie ' + id
    };

    return {
        jsonGraph: {videos: videos},
        paths: [['videos', id, 'summary']]
    };
}

function generateMissingSummary(id) {
    var videos = {};
    videos[id] = {
        summary: { $type: $atom }
    };

    return {
        jsonGraph: {videos: videos},
        paths: [['videos', id, 'summary']]
    };
}

function generateState(id) {
    var videos = {state: {}};
    videos.state[id] = {
        $type: $atom,
        value: {
            title: 'Some State ' + id
        }
    };

    return {
        jsonGraph: {videos: videos},
        paths: [['videos', 'state', id]]
    };
}
