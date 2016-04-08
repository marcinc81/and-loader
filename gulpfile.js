var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var htmlmin = require('gulp-htmlmin');


function _js(entry, out, dist) {
		var s = gulp.src(entry)
					.pipe(rename(out))
					.pipe(
						browserify().on('error', function(err) {
							gutil.log(gutil.colors.red(err));
							gutil.beep();
						}));

		// only dist release
		if (dist) {
			s = s.pipe(ngAnnotate())
				 .pipe(uglify());
		}

		s.pipe(gulp.dest('./public/'));
}

gulp.task('default', function() {
	_js('./src/app.js', 'scripts.js', false);
});

gulp.task('dist', function() {
	gulp.src('./src/loader.js')
		.pipe(rename('and-loader.js'))
		.pipe(gulp.dest('./dist/'));

	gulp.src('./src/loader.js')
		.pipe(rename('and-loader.min.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
	gulp.watch('./src/**/*', ['default']);
});

