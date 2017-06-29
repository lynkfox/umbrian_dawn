var gulp = require('gulp');
var shell = require('gulp-shell');
var message = require('gulp-message');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

var jsFiles = [
    {
        name: 'app.js',
        nameMin: 'app.min.js',
        src: ['app/js/*.js', 'app/js/**/*.js'],
        output: 'js'
    }
];

var cssFiles = [
    {
        name: 'app.css',
        nameMin: 'app.min.css',
        src: ['app/css/*.css', 'app/css/**/*.css'],
        output: 'css'
    }
];

gulp.task('default', function() {
    message.info('gulp js');
    message.info('gulp css');
});

gulp.task('js', [], function() {
    for (var j in jsFiles) {
        gulp.src(jsFiles[j].src)
            .pipe(sourcemaps.init())
            .pipe(concat(jsFiles[j].name))
            .pipe(uglify())
            .pipe(rename(jsFiles[j].nameMin))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(jsFiles[j].output))
            .pipe(notify({
                message: "Finished javascript",
                onLast: true
            }));
    }
});

gulp.task('css', [], function() {
    for (var c in cssFiles) {
        gulp.src(cssFiles[c].src)
            .pipe(sourcemaps.init())
            .pipe(concat(cssFiles[c].name))
            .pipe(cleancss())
            .pipe(rename(cssFiles[c].nameMin))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(cssFiles[c].output))
            .pipe(notify({
                message: "Finished css",
                onLast: true
            }));
    }
});
