const babelify = require("babelify");
const browserify = require('browserify');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const del = require('del');
const electron = require('gulp-atom-electron');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gulpReplace = require('gulp-replace');
const gulpZip = require('gulp-zip');
const imagemin = require('gulp-imagemin');
const packageJson = require('./package.json');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const symdest = require('gulp-symdest');
const uglify = require('gulp-uglify');
const vinylZip = require('gulp-vinyl-zip');

const CHROME_TASK_IGNORED_FILES = ['./src/app/electron-auth.js', './src/app/file-system/electron.js', './src/app/stores/backend/electron.js'];
const ELECTRON_TASK_IGNORED_FILES = ['./src/app/file-system/chrome.js', './src/app/stores/backend/chrome.js'];
const ELECTRON_VERSION = '1.7.5';
const ELECTRON_PLATFORMS = [
  { name: 'darwin', architectures: ['x64'] },
  { name: 'linux', architectures: ['ia32', 'x64'] },
  { name: 'win32', architectures: ['ia32', 'x64'] }
];

gulp.task('default', ['chrome']);

gulp.task('chrome', ['chromeApp', 'chromeAssets']);

gulp.task('electron', ['electronApp', 'electronAssets']);

gulp.task('distChrome', function () {
  runSequence('clean', ['chromeAppMinified', 'chromeAssets'], function () {
    return gulp.src('./build/**')
        .pipe(gulpZip('dimpl-chrome.zip'))
        .pipe(gulp.dest('./dist/'));
  });
});

gulp.task('distElectron', function () {
  runSequence('clean', ['electronAppMinified', 'electronAssets'], function () {
    for (let platform of ELECTRON_PLATFORMS) {
      for (let arch of platform.architectures) {
        buildElectron(platform.name, arch)
      }
    }
  });
});

gulp.task('downloadElectron', function () {
  for (let platform of ELECTRON_PLATFORMS) {
    const name = platform.name;
    electron.dest('tmp/electron-' + name, { version: ELECTRON_VERSION, platform: name });
  }
});

gulp.task('chromeApp', function () {
  return buildApp(false, CHROME_TASK_IGNORED_FILES);
});

gulp.task('electronApp', function () {
  return buildApp(false, ELECTRON_TASK_IGNORED_FILES);
});

gulp.task('chromeAppMinified', function () {
  return buildApp(true, CHROME_TASK_IGNORED_FILES);
});

gulp.task('electronAppMinified', function () {
  return buildApp(true, ELECTRON_TASK_IGNORED_FILES);
});

gulp.task('chromeAssets', ['commonAssets'], function () {
  return gulp.src('./src/{chrome.js,manifest.json}')
      .pipe(gulp.dest('./build/'));
});

gulp.task('electronAssets', ['commonAssets', 'packageJson'], function () {
  return gulp.src('./src/electron.js')
      .pipe(gulp.dest('./build/'));
});

gulp.task('packageJson', function () {
  return gulp.src(['./package.json'])
      .pipe(gulpReplace('./src/electron.js', './electron.js'))
      .pipe(gulp.dest('./build/'));
});

gulp.task('commonAssets', ['css', 'img'], function () {
  return gulp.src('./src/index.html')
      .pipe(gulp.dest('./build/'));
});

gulp.task('css', function () {
  return gulp.src('./src/assets/css/**/*.css')
      .pipe(cssnano())
      .pipe(concat('bundle.css'))
      .pipe(gulp.dest('./build/assets/css/'));
});

gulp.task('img', function () {
  return gulp.src('./src/assets/img/**')
      .pipe(imagemin())
      .pipe(gulp.dest('./build/assets/img'));
});

gulp.task('clean', function (callback) {
  return del(['./build/**'], callback);
});

function buildApp(shouldMinify, ignoredFiles) {
  const b = browserify('./src/app');
  ignoredFiles.forEach((f) => b.ignore(f));
  return b.transform('babelify', { presets: ['es2015', 'react'] })
      .bundle()
      .pipe(source('app.js'))
      .pipe(gulpIf(shouldMinify, streamify(uglify())))
      .pipe(gulp.dest('./build/'));
}

function buildElectron(platform, arch) {
  const filename = 'dimpl-' + platform + '-' + arch + '.zip';

  return gulp.src('build/**')
      .pipe(electron({
        version: ELECTRON_VERSION,
        platform: platform,
        arch: arch,
        darwinIcon: './resources/icon.icns',
        winIcon: './resources/icon.ico'
      }))
      .pipe(vinylZip.dest('./dist/' + filename));
}
