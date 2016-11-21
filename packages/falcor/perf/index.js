var suites = [
    // require('./get'),
    // require('./set'),
    // require('./version'),
    require('./dataSource'),
];

run();

function run() {
    if (suites.length === 0) {
        console.log('finished');
        return;
    }
    var suite = suites.shift();
    console.log('running ' + suite.name);
    suite.on('complete', function() {
        console.log('finished ' + suite.name + '\n' + this.map(function(x) {

            var str = x.name + ': \n\t' + x.hz + ' ops/s\n\t';

            var meanMsPerOp = Math.round(x.stats.mean * 100000)/100;
            str += meanMsPerOp + ' ms/op\n\t';

            var sliceOf60FPS = Math.round((meanMsPerOp / (1000/60)) * 100000)/1000;
            str += sliceOf60FPS + '% of 1 frame @ 60FPS\n';

            return str;
        }).join('\n'));
        setTimeout(run, 1000);
    })
    .run({ async: true });
}
