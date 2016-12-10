var Rx = require('rxjs');
var Observable = Rx.Observable;
var TestRunner = require('./../TestRunner');
var falcor = require('@graphistry/falcor');
var letDelayEach = require('./letDelayEach');
var $ref = falcor.Model.ref;

module.exports = function() {
    return {
        Integers: function(fn, delay, batch) {
            return [{
                route: 'genreLists[{integers:indices}]',
                get: function(path) {
                    if (fn) { fn(path); }
                    return Observable
                        .from(path.indices)
                        .map(function(id) {
                            var xs = {
                                paths: [['genreLists', id]],
                                jsonGraph: {
                                    genreLists: {}
                                }
                            };
                            xs.jsonGraph.genreLists[id] = $ref(['videos', id]);
                            return xs;
                        })
                        .let(letDelayEach(delay, batch));
                }
            }, {
                route: 'genreLists.push',
                call: function(path, args) {
                    return Observable
                        .from(args)
                        .map(function(newTitleRef, newTitleIndex) {
                            return {
                                path: ['genreLists', newTitleIndex],
                                value: newTitleRef
                            };
                        })
                        .let(letDelayEach(delay, batch));
                }
            }];
        },
        Ranges: function(fn, delay, batch) {
            return [{
                route: 'genreLists[{ranges:indices}]',
                get: function(path) {
                    if (fn) { fn(path); }
                    return Observable
                        .from(TestRunner.rangeToArray(path.indices))
                        .map(function(id) {
                            var xs = {
                                paths: [['genreLists', id]],
                                jsonGraph: {
                                    genreLists: {}
                                }
                            };
                            xs.jsonGraph.genreLists[id] = $ref(['videos', id]);
                            return xs;
                        })
                        .let(letDelayEach(delay, batch))
                }
            }, {
                route: 'genreLists.push',
                call: function(path, args) {
                    return Observable
                        .from(args)
                        .map(function(newTitleRef, newTitleIndex) {
                            return {
                                path: ['genreLists', newTitleIndex],
                                value: newTitleRef
                            };
                        })
                        .concat(Observable.of({
                            invalidated: true,
                            path: ['genreLists', 'top-rated']
                        }))
                        .let(letDelayEach(delay, batch));
                }
            }];
        }
    };
};
