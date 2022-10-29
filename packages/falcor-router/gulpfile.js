require('babel-register');

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-istanbul');

gulp.task('lint-src', function() {
    return gulp.src('src/**/*.js').
        pipe(eslint()).
        pipe(eslint.format()).
        pipe(eslint.failAfterError());
});

gulp.task('lint-test', function() {
    return gulp.src('test/**/*.js').
        pipe(eslint()).
        pipe(eslint.format()).
        pipe(eslint.failAfterError());
});

gulp.task('lint-root', function() {
    return gulp.src('*.js').
        pipe(eslint()).
        pipe(eslint.format()).
        pipe(eslint.failAfterError());
});

gulp.task('lint', gulp.series('lint-src', 'lint-test', 'lint-root'));

gulp.task('test', function (cb) {
  gulp.src(['./test/index.js'])
    .pipe(mocha({
        timeout: 2000,
        useColors: true,
        fullTrace: false,
        reporter: 'dot'
    }))
    .on('end', cb);
});

gulp.task('test-coverage', function (cb) {
    gulp.src(['./src/**/*.js']).
        pipe(istanbul()).
        pipe(istanbul.hookRequire()).
        on('finish', function () {
            gulp.src(['./test/index.js']).
                pipe(mocha({
                    timeout: 2000,
                    useColors: true,
                    fullTrace: false,
                    reporter: 'dot'
                })).
                pipe(istanbul.writeReports()).
                on('end', cb);
        });
});

gulp.task('dist', gulp.series('lint', 'test-coverage'));
