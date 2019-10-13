const gulp = require('gulp')
const rhtmlBuildUtils = require('rhtmlBuildUtils')

gulp.task('testSpecs', gulp.series(function (done) {
  console.log('skipping test')
  done()
}))

const dontRegisterTheseTasks = ['testSpecs']
rhtmlBuildUtils.registerGulpTasks({ gulp, exclusions: dontRegisterTheseTasks })
