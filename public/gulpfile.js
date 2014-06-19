var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var nib = require('nib');

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
	gulp.src(["./dev/img/*"])
		.pipe(gulp.dest("./build/img"));
});

gulp.task('cortex', function() {
	gulp.src(["./dev/js/neurons/**/*"])
		.pipe(gulp.dest("./build/neurons"));
});


gulp.task('watch', function() {
	// gulp.watch(["./dev/views/**/*.jade"], ['jade']);
	gulp.watch(["./dev/css/**/*.styl"], ['stylus']);
	gulp.watch(["./dev/js/neurons/**/*"], ['cortex']);
});


gulp.task('default', ['stylus', 'img', 'cortex', 'watch']);
gulp.task('build', ['stylus', 'img', 'cortex']);