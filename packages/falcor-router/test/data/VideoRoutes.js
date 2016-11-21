var Rx = require('rxjs');
var Observable = Rx.Observable;
var R = require('../../src/Router');
var TestRunner = require('./../TestRunner');
var letDelayEach = require('./letDelayEach');
var Model = require('@graphistry/falcor').Model;
var $atom = Model.atom;

module.exports = function() {
    return {
        Summary: function (fn, delay) {
            return [{
                route: 'videos.summary',
                get: function(path) {
                    fn && fn(path);
                    return Observable.return({
                        jsonGraph: {
                            videos: {
                                summary: $atom(75)
                            }
                        },
                        paths: [['videos', 'summary']]
                    })
                    .let(letDelayEach(delay));
                }
            }];
        },
        Keys: {
            Summary: function (fn, delay) {
                return [{
                    route: 'videos[{keys}].summary',
                    get: function (path) {
                        fn && fn(path);
                        return Observable.
                            from(path[1]).
                            map(function(id) {
                                return generateVideoJSONG(id);
                            })
                            .let(letDelayEach(delay));
                    }
                }];
            }
        },
        Integers: {
            Summary: function (fn, delay) {
                return [{
                    route: ['videos', R.integers, 'summary'],
                    get: function (path) {
                        fn && fn(path);
                        return Observable.
                            from(path[1]).
                            map(function(id) {
                                return generateVideoJSONG(id);
                            })
                            .let(letDelayEach(delay));
                    }
                }];
            }
        },

        Ranges: {
            Summary: function (fn, delay) {
                return [{
                    route: ['videos', R.ranges, 'summary'],
                    get: function (path) {
                        fn && fn(path);
                        return Observable.
                            from(TestRunner.rangeToArray(path[1])).
                            map(function(id) {
                                return generateVideoJSONG(id);
                            })
                            .let(letDelayEach(delay));
                    }
                }];
            }
        },
        State: {
            Keys: function (fn, delay) {
                return [{
                    route: ['videos', 'state', R.keys],
                    get: function (path) {
                        fn && fn(path);
                        return Observable.
                            from(path[2]).
                            map(function(key) {
                                return generateVideoStateJSONG(key);
                            })
                            .let(letDelayEach(delay));
                    }
                }];
            },
            Integers: function (fn, delay) {
                return [{
                    route: ['videos', 'state', R.integers],
                    get: function (path) {
                        fn && fn(path);
                        return Observable.
                            from(path[2]).
                            map(function(key) {
                                return generateVideoStateJSONG(key);
                            })
                            .let(letDelayEach(delay));
                    }
                }];
            },
            Ranges: function (fn, delay) {
                return [{
                    route: ['videos', 'state', R.ranges],
                    get: function (path) {
                        fn && fn(path);
                        return Observable.
                            from(TestRunner.rangeToArray(path[2])).
                            map(function(key) {
                                return generateVideoStateJSONG(key);
                            })
                            .let(letDelayEach(delay));
                    }
                }];
            }
        }
    };
};

function generateVideoJSONG(id) {
    var videos;
    var jsongEnv = {
        jsonGraph: {videos: (videos = {})},
        paths: [['videos', id, 'summary']]
    };
    videos[id] = {summary: $atom({title: 'Some Movie ' + id})};

    return jsongEnv;
}

function generateVideoStateJSONG(id) {
    var videos;
    var jsongEnv = {
        jsonGraph: {videos: (videos = {state: {}})},
        paths: [['videos', 'state', id]]
    };
    videos.state[id] = $atom({title: 'Some State ' + id});

    return jsongEnv;
}
