
var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');

gulp.task('server-es6', function () {
    return gulp.src('server/**/*.es6')
        .pipe(babel())
        .pipe(gulp.dest('server/_compiled'));
});

gulp.task('server-es6-watch', function () {
    return gulp.src('server/**/*.es6')
        .pipe(watch('server/**/*.es6'))
        .pipe(plumber())
        .pipe(babel())
        .pipe(plumber.stop())
        .pipe(gulp.dest('server/_compiled'));
});

gulp.task('client-es6', function () {
    return gulp.src('www/**/*.es6')
        .pipe(babel())
        .pipe(gulp.dest('www/_js'));
});

gulp.task('client-es6-watch', function () {
    return gulp.src('www/**/*.es6')
        .pipe(watch('www/**/*.es6'))
        .pipe(plumber())
        .pipe(babel())
        .pipe(plumber.stop())
        .pipe(gulp.dest('www/_js'));
});

gulp.task('default', ['server-es6', 'client-es6']);
gulp.task('watch', ['server-es6-watch', 'client-es6-watch']);
