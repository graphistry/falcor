var Observable = require('rxjs').Observable;

module.exports = function letDelayEach(delay, batch, index) {
    return function(source) {
        if (batch === true) {
            return source.toArray();
        } else if (typeof delay === 'number') {
            return source.concatMap(function(x) {
                return Observable.timer(delay).mapTo(x);
            });
        } else if (Array.isArray(delay)) {
            if (typeof index === 'number') {
                return Observable.timer(delay[index]).mergeMapTo(source);
            } else {
                return source.mergeMap(function(x, i) {
                    return Observable.timer(delay[i]).mapTo(x);
                });
            }
        }
        return source;
    }
}
