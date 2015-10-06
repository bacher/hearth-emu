
var gulp = require('gulp');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');

gulp.task('all', function () {
    return gulp.src('server/**/*.es6')
        .pipe(babel())
        .pipe(gulp.dest('server/_compiled'));
});

gulp.task('default', function () {
    return gulp.src('server/**/*.es6')
        .pipe(watch('server/**/*.es6'))
        .pipe(plumber())
        .pipe(babel())
        .pipe(plumber.stop())
        .pipe(gulp.dest('server/_compiled'));
});
