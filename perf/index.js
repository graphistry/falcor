var suites = [
    require('./paths'),
    require('./route')
];

run();

function run() {
    if (suites.length === 0) {
        console.log('finished');
        return;
    }
    var suite = suites.shift();
    console.log('starting ' + suite.name);
    suite.on('complete', function() {
        console.log('completed ' + suite.name + ': ' + this.map(function(x) {
            return x.name + ': ' + x.hz + ' ops/s';
        }).join('\n'));
        setTimeout(run, 10);
    })
    .run({ async: true });
}
