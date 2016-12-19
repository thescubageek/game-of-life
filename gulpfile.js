var gulp       = require('gulp'),
    concat     = require('gulp-concat'),
    uglify     = require('gulp-uglify'),
    debug      = require('gulp-debug'),
    cache      = require('gulp-cached'),
    scss       = require('gulp-sass'),
    babel      = require('gulp-babel'),
    rename     = require("gulp-rename"),
    livereload = require('gulp-livereload'),
    shell = require('gulp-shell');

var paths = {
  es2015: ['assets/js/es6/*.js','assets/js/es6/gol/*.js'],
  scss:   ['assets/css/scss/*.scss']
};

gulp.task('es2015', function()  {
  return gulp.src(paths.es2015)
    .pipe(cache('es2015files'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(rename(function(path) {
      var s = path.dirname;
      var a = s.split('/');
      path.dirname = s.replace(a[a.length-1], '');
    }))
    .pipe(gulp.dest(function(file) {
      if (file.base.indexOf('gol') !== -1){
        return "assets/js/gol";
      } else {
        return "assets/js";
      }
    }))
    .pipe(livereload());
});

gulp.task('scss', function () {
  return gulp.src(paths.scss)
    .pipe(cache('scssfiles'))
    .pipe(scss({outputStyle: 'compressed'})
    .on('error', scss.logError))
    .pipe(rename(function(path) {
      var s = path.dirname;
      var a = s.split('/');
      path.dirname = s.replace(a[a.length-1], '');
    }))
    .pipe(gulp.dest(function(file) { return "assets/css"; }))
    .pipe(livereload());
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.scss, ['scss']);
  gulp.watch(paths.es2015, ['es2015']);
});

gulp.task('default', ['watch', 'scss', 'es2015']);
