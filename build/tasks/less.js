const gulp = require('gulp');
const less = require('gulp-less');

gulp.task('less', function () {
  return gulp.src('theSrc/styles/**/*.less')
    .pipe(less({}))
    .pipe(gulp.dest('browser/styles'))
    .pipe(gulp.dest('inst/htmlwidgets/lib/style'));
});
