var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var browserify = require('gulp-browserify');
var reactify = require('reactify');
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var livereload = process.env.NODE_ENV != 'production' ? require('gulp-livereload') : null;
var nodemon = process.env.NODE_ENV != 'production' ? require('gulp-nodemon') : null;

// compiled files are created in build/

gulp.task('less', function() {
  gulp.src('./less/app.less')
    .pipe(less())
    .pipe(minifyCss())
    .pipe(gulp.dest('./build/css'))
});

// gulp.task('react', function() {
//   gulp.src('react/*.jsx')
//     .pipe(react())
//     .pipe(gulp.dest('./build/js'))
// });

gulp.task('reactify', function() {
  gulp.src('react/*.jsx', {read: false})
    .pipe(browserify({
      transform: ['reactify'],
      extensions: ['.jsx'],
    }))
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('./build/js'))
});

gulp.task('server', function() {
  nodemon({
    script: 'app.js',
    ext: 'js',
    ignore: ['build/**'],
    env: {'NODE_ENV': 'development'}
  }).on('restart', function() {
    console.log('restarting...');
  });
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['./less/*.less'], ['less']);
  gulp.watch(['./react/*.jsx'], ['reactify']);
  // gulp.watch(['./react/*.jsx'], ['react']);
  gulp.watch(['./build/**'])
    .on('change', livereload.changed)
});

gulp.task('dev', ['watch', 'less', 'reactify', 'server']);
gulp.task('default', ['less', 'reactify']);
