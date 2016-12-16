var gulp       = require('gulp'),
    uglify     = require('gulp-uglify'),
    scss       = require('gulp-sass'),
    cache      = require('gulp-cached'),
    babel      = require('gulp-babel'),
    rename     = require("gulp-rename"),
    livereload = require('gulp-livereload'),
    shell = require('gulp-shell');

var paths = {
  es2015: ['assets/js/es6/*.js'],
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
    .pipe(gulp.dest(function(file) { return file.base; }))
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
    .pipe(gulp.dest(function(file) { return file.base; }))
    .pipe(livereload());
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.scss, ['scss']);
  gulp.watch(paths.es2015, ['es2015']);
  //Squirelly hack, needed to get .scss files to livereload gulp-livereload v3.8.1 is screwey, might delete in future updates.
  gulp.watch(paths.scss, function(ev){
    livereload.changed(ev.path);
  });
});

gulp.task('default', ['watch', 'scss', 'es2015']);
