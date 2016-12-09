var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('js', function() {
	return gulp.src([
			"./node_modules/jquery/dist/jquery.min.js",
			"./node_modules/bootstrap/dist/js/bootstrap.min.js"
		])
		.pipe(concat('compiled.js'))
		.pipe(gulp.dest('./js/'));
});
