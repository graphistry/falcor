global.DEBUG = false;

var suites = [
    require('./get'),
    require('./set'),
    require('./dataSource')
];

console.log('Running Falcor performance tests...\n');

run();

function run() {
    if (suites.length === 0) {
        return;
    }
    var suite = suites.shift();
    suite.on('complete', function() {
        console.log(suite.name + ':\n' + this.map(function(x) {

            var str = x.toString();
            var meanMsPerOp = Math.round(x.stats.mean * 100000)/100;
            var sliceOf60FPS = Math.round((meanMsPerOp / (1000/60)) * 100000)/1000;

            return str + ' (' + sliceOf60FPS + '% of 1 frame @ 60FPS)' + (x.suffix || '');
        }).join('\n') + '\n');
        setTimeout(run, 1000);
    })
    .run({ async: true });
}
