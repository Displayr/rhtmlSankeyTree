const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes in the browser directory and reload chrome on changes
  gulp.watch([
    'browser/**/*',
  ]).on('change', $.livereload.changed);

  // when these files change then do this,
  // for example when the json file changes rerun the copy command
  gulp.watch('theSrc/**/*.json', ['copy']);
  gulp.watch('theSrc/internal_www/**/*.html', ['copy']);
  gulp.watch('theSrc/internal_www/**/*.css', ['copy']);
  gulp.watch('theSrc/internal_www/**/*.js', ['copy']);
  gulp.watch('theSrc/styles/**/*.less', ['less']);
  gulp.watch('theSrc/styles/**/*.css', ['copy']);
  gulp.watch('theSrc/scripts/**/*.js', ['copy']);
  //gulp.watch(['theSrc/internal_www/js/*.js', 'theSrc/scripts/*.js'], ['compileInternalWeb']);
});
