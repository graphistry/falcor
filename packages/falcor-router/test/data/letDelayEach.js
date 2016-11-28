var Observable = require('rxjs').Observable;

module.exports = function letDelayEach(delay, batch, index) {
    return function(source) {
        if (batch === true) {
            return source.toArray();
        } else if (typeof delay === 'number') {
            return source.concatMap(function(x) {
                return Observable.of(x).delay(delay);
            });
        } else if (Array.isArray(delay)) {
            if (typeof index === 'number') {
                return source.delay(delay[index]);
            } else {
                return source.mergeMap(function(x, i) {
                    return Observable.of(x).delay(delay[i]);
                });
            }
        }
        return source;
    }
}
