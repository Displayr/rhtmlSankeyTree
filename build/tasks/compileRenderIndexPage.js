
const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const gutil = require('gulp-util');
const tap = require('gulp-tap');
const buffer = require('gulp-buffer');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('compileRenderIndexPage', function () {
  return gulp.src('theSrc/internal_www/js/renderIndexPage.js', { read: false })
    .pipe(tap(function (file) {
      gutil.log(`bundling ${file.path}`);

      file.contents = browserify(file.path, { debug: true })
        .transform(babelify, {
          presets: ['es2015-ie'],
          plugins: ['transform-object-assign', 'array-includes'],
        })
        .bundle();
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('browser/js/'));
});
