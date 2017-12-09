/* jshint node:true */
'use strict';
// generated on 2017-10-06 using generator-simpler-gulp-webapp 1.0.2
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('jshint', function () {
  return gulp.src('lib/js/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('build', ['jshint'], function () {
  // return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', [], function () {
  gulp.start('build');
});
