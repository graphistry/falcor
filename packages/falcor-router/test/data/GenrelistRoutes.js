var Rx = require('rxjs');
var Observable = Rx.Observable;
var TestRunner = require('./../TestRunner');
var falcor = require('@graphistry/falcor');
var letDelayEach = require('./letDelayEach');
var $ref = falcor.Model.ref;

module.exports = function() {
    return {
        Integers: function(fn, delay) {
            return [{
                route: 'genreLists[{ranges:indices}]',
                get: function(path) {
                    if (fn) { fn(path); }
                    return Observable.defer(function() {
                        var genreLists = {};
                        TestRunner.rangeToArray(path.indices).
                            forEach(function(x) {
                                genreLists[x] = $ref(['videos', x]);
                            });

                        return Observable.return({
                            jsonGraph: {
                                genreLists: genreLists
                            }
                        });
                    })
                    .let(letDelayEach(delay));
                }
            }];
        },
        Ranges: function(fn, delay) {
            return [{
                route: 'genreLists[{ranges:indices}]',
                get: function(path) {
                    if (fn) { fn(path); }
                    return Observable.
                        from(TestRunner.rangeToArray(path[1])).
                        map(function(id) {
                            var xs = {
                                paths: [['genreLists', id]],
                                jsonGraph: {
                                    genreLists: {}
                                }
                            };
                            xs.jsonGraph.genreLists[id] = $ref(['videos', id]);
                            return xs;
                        })
                        .let(letDelayEach(delay))
                }
            }];
        }
    };
};
