var Observable = require('rxjs').Observable;

module.exports = function letDelayEach(delay) {
    return function(source) {
        if (typeof delay === 'number') {
            return source.concatMap(function(x) {
                return Observable.of(x).delay(delay);
            });
        } else if (Array.isArray(delay)) {
            return source.mergeMap(function(x, i) {
                return Observable.of(x).delay(delay[i]);
            });
        }
        return source;
    }
}
