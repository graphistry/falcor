var Rx = require('rx');
var Observable = Rx.Observable;
var falcor = require('./../../falcor.js');
var _ = require('lodash');
var noOp = function(a, b, c) { return c; };

var LocalSource = module.exports = function(cache, options) {
    this._options = _.extend({
        miss: 0,
        onGet: noOp,
        onSet: noOp,
        onResults: noOp,
        wait: false,
        materialize: false
    }, options);
    this._missCount = 0;
    this.model = new falcor.Model({cache: cache});

    if (this._options.materialize) {
        this.model = this.model._materialize();
    }
};

LocalSource.prototype = {
    setModel: function(modelOrCache) {
        if (modelOrCache instanceof falcor.Model) {
            this.model = modelOrCache;
        } else {
            this.model = new falcor.Model({cache: modelOrCache});
        }
    },
    get: function(paths) {
        var self = this;
        var options = this._options;
        var miss = options.miss;
        var onGet = options.onGet;
        var onResults = options.onResults;
        var wait = +options.wait;
        var errorSelector = options.errorSelector;
        return Rx.Observable.create(function(observer) {
            function exec() {
                var results;
                var seed = {};
                if (self._missCount >= miss) {
                    onGet(self, paths);
                    self.model._getPathValuesAsJSONG(self.model, paths, seed, errorSelector);
                } else {
                    self._missCount++;
                }

                onResults(seed);
                observer.onNext(seed);
                observer.onCompleted();
            }
            if (wait > 0) {
                setTimeout(exec, wait);
            } else {
                exec();
            }
        });
    },
    set: function(jsongEnv) {
        var self = this;
        var options = this._options;
        var miss = options.miss;
        var onSet = options.onSet;
        var onResults = options.onResults;
        var wait = +options.wait;
        var errorSelector = options.errorSelector;
        return Rx.Observable.create(function(observer) {
            function exec() {
                var seed = {};
                var tempModel = new falcor.Model({
                    cache: jsongEnv.jsonGraph,
                    errorSelector: errorSelector});
                jsongEnv = onSet(self, tempModel, jsongEnv);

                tempModel.set(jsongEnv).subscribe();
                tempModel._getPathValuesAsJSONG(
                    tempModel,
                    jsongEnv.paths,
                    seed);

                // always output all the paths
                onResults(seed);
                observer.onNext(seed);
                observer.onCompleted();
            }

            if (wait > 0) {
                setTimeout(exec, wait);
            } else {
                exec();
            }
        });
    },
    call: function(path, args, suffixes, paths) {
        return Rx.Observable.empty();
    }
};

