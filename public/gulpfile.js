var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var nib = require('nib');
var rename = require("gulp-rename");

process.on("uncaughtException", function(err) {
  console.log(err);
});

gulp.task('stylus', function() {
  var stylusOptions = {
    use: [nib()],
    "import": ["nib"]
  };
  gulp.src(["./dev/css/**/*.styl"])
    .pipe(stylus(stylusOptions))
    .on('error', console.log)
    .pipe(gulp.dest('./build/css'));
});

gulp.task('jade', function() {
  gulp.src(["./dev/views/*.jade"])
    .pipe(jade())
    .pipe(gulp.dest("./build/"));
});

gulp.task('img', function() {
  gulp.src("./dev/img/*")
    .pipe(rename(function (path) {
        path.basename += "@2x";
    }))
    .pipe(gulp.dest("./build/img"));

  return gulp.src(["./dev/img/*"])
    .pipe(gulp.dest("./build/img"));


});

gulp.task('css', function() {
  return gulp.src(["./dev/css/lib/**/*"])
    .pipe(gulp.dest("./build/css/lib"));
});

gulp.task('cortex', ['neuron'], function() {
  return gulp.src(['./dev/js/neurons/**/*'])
    .pipe(gulp.dest("./build/neurons/"));
});

gulp.task('neuron',function(){
  return gulp.src(['./dev/js/neuron.js'])
    .pipe(gulp.dest("./build/"));
});

gulp.task('static-files', function() {
  return gulp.src(['./dev/robots.txt'])
    .pipe(gulp.dest("./build"));
});


gulp.task('watch', function() {
  // gulp.watch(["./dev/views/**/*.jade"], ['jade']);
  gulp.watch(["./dev/css/**/*.styl"], ['stylus']);
  gulp.watch(['./dev/js/neurons/**/*'], ['cortex']);
});


gulp.task('default', ['static-files', 'stylus', 'img', 'cortex', 'css','watch']);
gulp.task('build', ['static-files', 'stylus', 'img', 'cortex','css']);
