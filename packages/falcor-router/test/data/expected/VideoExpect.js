var $atom = require('./../../../src/support/types').$atom;
module.exports = function() {
    var retVal = {
        state: generateState,
        summary: generateSummary,
        Summary: {
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
            summary: generateSummary(key)
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
        // summary: {
        //     $type: $atom,
        //     value: {
        //         title: 'Some Movie ' + id
        //     }
        // }
    };

    return {
        jsonGraph: {videos: videos}
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
        jsonGraph: {videos: videos}
    };
}
