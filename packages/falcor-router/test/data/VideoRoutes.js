var Rx = require('rxjs');
var Observable = Rx.Observable;
var R = require('../../src/Router');
var TestRunner = require('./../TestRunner');
var letDelayEach = require('./letDelayEach');
var Model = require('@graphistry/falcor').Model;
var $atom = Model.atom;

module.exports = function() {
    return {
        Summary: function (fn, delay, batch) {
            var setIndex = -1;
            return [{
                route: 'videos.summary',
                set: function(jsonGraph) {
                    return Observable.of({
                        jsonGraph: jsonGraph
                    })
                    .let(letDelayEach(delay, batch, ++setIndex));
                },
                get: function(path) {
                    fn && fn(path);
                    return Observable.of({
                        relative: true,
                        path: ['summary'],
                        value: $atom(75)
                    })
                    .let(letDelayEach(delay, batch));
                }
            }];
        },
        Keys: {
            Summary: function (fn, delay, batch) {
                var setIndex = -1;
                return [{
                    route: 'videos[{keys}].summary',
                    set: function(jsonGraph) {
                        return Observable.of({
                            jsonGraph: jsonGraph
                        })
                        .let(letDelayEach(delay, batch, ++setIndex));
                    },
                    get: function (path) {
                        fn && fn(path);
                        return Observable
                            .from(Array.from(path[1], function(id, index) {
                                return index % 2 === 0 ?
                                    generateVideoPV(id) :
                                    generateVideoJSONG(id);
                            }))
                            .let(letDelayEach(delay, batch));
                    }
                }];
            }
        },
        Integers: {
            Summary: function (fn, delay, batch) {
                var setIndex = -1;
                return [{
                    route: ['videos', R.integers, 'summary'],
                    set: function(jsonGraph) {
                        return Observable.of({
                            jsonGraph: jsonGraph
                        })
                        .let(letDelayEach(delay, batch, ++setIndex));
                    },
                    get: function (path) {
                        fn && fn(path);
                        return Observable
                            .from(Array.from(path[1], function(id, index) {
                                return index % 2 === 0 ?
                                    generateVideoPV(id) :
                                    generateVideoJSONG(id);
                            }))
                            .let(letDelayEach(delay, batch));
                    }
                }, {
                    route: ['videos', R.integers, 'update'],
                    call: function(path, args) {
                        fn && fn(path);
                        return Observable
                            .from(Array.from(path[1], function(id, index) {
                                return [{
                                    invalidated: true,
                                    path: ['videos', id, 'summary']
                                }, {
                                    value: args[index],
                                    path: ['videos', id, 'summary']
                                }]
                            }))
                            .mergeMap(function (xs) { return xs; })
                            .let(letDelayEach(delay, batch));
                    }
                }];
            }
        },

        Ranges: {
            Summary: function (fn, delay, batch) {
                var setIndex = -1;
                return [{
                    route: ['videos', R.ranges, 'summary'],
                    set: function(jsonGraph) {
                        return Observable.of({
                            jsonGraph: jsonGraph
                        })
                        .let(letDelayEach(delay, batch, ++setIndex));
                    },
                    get: function (path) {
                        fn && fn(path);
                        return Observable.
                            from(Array.from(TestRunner.rangeToArray(path[1]), function(id, index) {
                                return index % 2 === 0 ?
                                    generateVideoPV(id) :
                                    generateVideoJSONG(id);
                            }))
                            .let(letDelayEach(delay, batch));
                    }
                }, {
                    route: ['videos', R.ranges, 'update'],
                    call: function(path, args) {
                        fn && fn(path);
                        return Observable
                            .from(Array.from(TestRunner.rangeToArray(path[1]), function(id, index) {
                                return [{
                                    invalidated: true,
                                    path: ['videos', id, 'summary']
                                }, {
                                    value: args[index],
                                    path: ['videos', id, 'summary']
                                }]
                            }))
                            .let(letDelayEach(delay, batch))
                    }
                }];
            }
        },
        State: {
            Keys: function (fn, delay, batch) {
                return [{
                    route: ['videos', 'state', R.keys],
                    get: function (path) {
                        fn && fn(path);
                        return Observable
                            .from(path[2])
                            .map(function(key) {
                                return generateVideoStateJSONG(key);
                            })
                            .let(letDelayEach(delay, batch));
                    }
                }];
            },
            Integers: function (fn, delay, batch) {
                return [{
                    route: ['videos', 'state', R.integers],
                    get: function (path) {
                        fn && fn(path);
                        return Observable
                            .from(path[2])
                            .map(function(key) {
                                return generateVideoStateJSONG(key);
                            })
                            .let(letDelayEach(delay, batch));
                    }
                }];
            },
            Ranges: function (fn, delay, batch) {
                return [{
                    route: ['videos', 'state', R.ranges],
                    get: function (path) {
                        fn && fn(path);
                        return Observable
                            .from(TestRunner.rangeToArray(path[2]))
                            .map(function(key) {
                                return generateVideoStateJSONG(key);
                            })
                            .let(letDelayEach(delay, batch));
                    }
                }];
            }
        }
    };
};

function generateVideoPV(id) {
    return {
        relative: true,
        path: [id, 'summary'],
        value: 'Some Movie ' + id
        // value: $atom({ title: 'Some Movie ' + id })
    };
}

function generateVideoJSONG(id) {
    var videos;
    var jsongEnv = {
        jsonGraph: {videos: (videos = {})},
        paths: [['videos', id, 'summary']]
    };
    // videos[id] = {summary: $atom({ title: 'Some Movie ' + id })};
    videos[id] = { summary: 'Some Movie ' + id };

    return jsongEnv;
}

function generateVideoStateJSONG(id) {
    var videos;
    var jsongEnv = {
        jsonGraph: {videos: (videos = {state: {}})},
        paths: [['videos', 'state', id]]
    };
    videos.state[id] = $atom({ title: 'Some State ' + id });

    return jsongEnv;
}
