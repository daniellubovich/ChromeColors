var gulp = require('gulp'),
    concat = require('gulp-concat'),
    copy = require('gulp-copy'),
    sass = require('gulp-sass'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    watch = require('gulp-watch'); // not using this yet

var vendorScripts = [
    "./node_modules/jquery/dist/jquery.min.js",
    "./node_modules/bootstrap/dist/js/bootstrap.min.js",
    "./node_modules/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min.js"
];

var vendorCss = [
    './node_modules/bootstrap-colorpicker/dist/css/**/*.css'
];

gulp.task('browserify', function() {
    return browserify('js/index.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('bundle.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('js'));
});

// Custom Tasks
gulp.task('sass', function() {
    return gulp.src(['./css/**/*.scss'])
        .pipe(sass())
        .pipe(concat('compiled.css'))
        .pipe(gulp.dest('./css'))
});

gulp.task('watch', function() {
    gulp.watch('./css/**/*.scss', ['sass']);
});

// Vendor Tasks
gulp.task('js', function() {
    return gulp.src(vendorScripts)
        .pipe(concat('compiled.js'))
        .pipe(gulp.dest('./js/'));
});

gulp.task('css', function() {
    return gulp.src(vendorCss)
        .pipe(gulp.dest('./css'))
});

gulp.task('img', function() {
    var imagePaths = [
        './node_modules/bootstrap-colorpicker/dist/img/**/*.png'
    ];

    return gulp.src(imagePaths)
        .pipe(gulp.dest('./img'))
});

gulp.task('default', ['browserify', 'sass', 'js', 'css', 'img'])