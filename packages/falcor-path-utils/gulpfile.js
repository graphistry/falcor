var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function (cb) {
  gulp.src(['./test/index.js'])
    .pipe(mocha({
        timeout: 2000,
        useColors: true,
        fullTrace: true,
        reporter: 'dot'
    }))
    .on('end', cb);
});
