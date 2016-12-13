var gulp = require('gulp');
var concat = require('gulp-concat');
var watch = require('gulp-watch'); // not using this yet

var vendorScripts = [
  "./node_modules/jquery/dist/jquery.min.js",
  "./node_modules/bootstrap/dist/js/bootstrap.min.js"
];


gulp.task('js', function() {
	return gulp.src(vendorScripts)
		.pipe(concat('compiled.js'))
		.pipe(gulp.dest('./js/'));
});
