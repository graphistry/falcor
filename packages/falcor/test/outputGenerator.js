var jsonGraph = require('@graphistry/falcor-json-graph');
var ref = jsonGraph.ref;
var atom = jsonGraph.atom;
var VIDEO_COUNT_PER_LIST = 10;

module.exports = {
    videoGenerator: function(ids, fields) {
        fields = fields || ['title'];
        var videos = {};
        videos[ƒ_meta] = {
            [ƒm_abs_path]:    ['videos'],
            [ƒm_deref_from]:  undefined,
            [ƒm_deref_to]:    undefined
        };

        var json = {
            json: {
                videos: videos
            }
        };

        ids.forEach(function(id, i) {
            var video = {};
            video[ƒ_meta] = {
                [ƒm_abs_path]:    ['videos', id],
                [ƒm_deref_from]:  undefined,
                [ƒm_deref_to]:    undefined
            };

            fields.forEach(function(field) {
                video[field] = 'Video ' + id;
            });

            videos[id] = video;
        });

        return json;
    },
    lolomoGenerator: function(lists, items, fields) {
        fields = fields || ['title'];
        var lolomo = {
            [ƒ_meta]: {
                [ƒm_abs_path]:    ['lolomos', 1234],
                [ƒm_deref_from]:  undefined,
                [ƒm_deref_to]:    undefined
            },
        };
        var json = {
            json: {
                lolomo: lolomo
            }
        };

        lists.forEach(function(listIndex) {
            var list = {
                [ƒ_meta]: {
                    [ƒm_abs_path]:    getListRef(listIndex),
                    [ƒm_deref_from]:  undefined,
                    [ƒm_deref_to]:    undefined
                },
            };

            lolomo[listIndex] = list;

            items.forEach(function(itemIndex) {
                var ro = list[itemIndex] = {
                    [ƒ_meta]: {
                        [ƒm_abs_path]:    getListRef(listIndex).concat(itemIndex),
                        [ƒm_deref_from]:  undefined,
                        [ƒm_deref_to]:    undefined
                    },
                };
                ro.item = getItemObject(listIndex, itemIndex, fields);
            });
        });

        return json;
    }
};

var listIds = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E'
};
function getListRef(listIndex) {
    return ['lists', listIds[listIndex]];
}

function getItemObject(listIndex, itemIndex, fields) {
    var videoIdx = listIndex * VIDEO_COUNT_PER_LIST + itemIndex;
    var refPath = ['videos', videoIdx];
    var toReference = getListRef(listIndex).concat([itemIndex, 'item']);
    var item = {
        [ƒ_meta]: {
            [ƒm_abs_path]:    ['videos', videoIdx],
            [ƒm_deref_from]:  undefined,
            [ƒm_deref_to]:    undefined
        },
    };

    fields.forEach(function(f) {
        item[f] = 'Video ' + videoIdx;
    });

    return item;
}
