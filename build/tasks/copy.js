const gulp = require('gulp');
const rename = require('gulp-rename');

gulp.task('copy', function () {
  gulp.src([
    'theSrc/scripts/**/*.*',
  ], {}).pipe(gulp.dest('inst/htmlwidgets'));

  // gulp.src([
  //   'theSrc/scripts/*.*',
  // ], {}).pipe(gulp.dest('inst/htmlwidgets'));

  gulp.src([
    'theSrc/styles/*.css',
  ], {}).pipe(gulp.dest('inst/htmlwidgets/lib/style'));

  gulp.src([
    'theSrc/scripts/**/*.js',
  ], {}).pipe(gulp.dest('browser/js'));

  // gulp.src([
  //   'theSrc/scripts/*.js',
  // ], {}).pipe(gulp.dest('browser/js'));

  gulp.src([
    'theSrc/styles/*.css',
  ], {}).pipe(gulp.dest('browser/style'));

  gulp.src([
    'theSrc/internal_www/**/*.*',
  ], {}).pipe(gulp.dest('browser'));

  // gulp.src([
  //   'theSrc/internal_www/*.*',
  // ], {}).pipe(gulp.dest('browser'));

});
