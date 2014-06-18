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
        "import" : ["nib"]
    };
	gulp.src(["./dev/css/**/*.styl"])
		.pipe(stylus(stylusOptions))
		.on('error',console.log)
		.pipe(gulp.dest('./build/css'));
});

gulp.task('jade', function() {
	gulp.src(["./dev/views/*.jade"])
		.pipe(jade())
		.pipe(gulp.dest("./build/"));

});


gulp.task('watch', function() {
	gulp.watch(["./dev/views/**/*.jade"], ['jade']);
	gulp.watch(["./dev/css/**/*.styl"], ['stylus']);
});

gulp.task('default', ['stylus', 'jade', 'watch']);