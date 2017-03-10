var jsList = ['Util', 'LazyLoad', 'Dialog', 'Messenger', 'Jquery-ui'],
    cssList = ['Jquery-ui', 'H-ui', 'Pager', 'Dialog'],

    gulp = require('gulp'),

    copy = require('gulp-copy'),
    rename = require('gulp-rename'),

    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),

    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),

    util = require('gulp-util'),
    notify = require('gulp-notify'),

    argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs');

//【内部调用函数】控制台错误处理
function handleErrors () {
    var args = Array.prototype.slice.call(arguments);

    notify.onError({
        title : 'compile error',
        message : '<%=error.message %>'
    }).apply(this, args);//替换为当前对象

    this.emit();//提交
}

gulp.task('browserify', function () {
    var stream = gulp.src('src/js/Util.js')
        .pipe(browserify({
            insertGlobals : false,
            debug : false
        }))
        .on('error', handleErrors)
        .pipe(gulp.dest('build/js'));

    return stream;
});

gulp.task('less', function () {
    var stream = gulp.src(['src/less/*.less'])
        .pipe(less())
        .on("error", handleErrors)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .on('error', handleErrors)
        .pipe(gulp.dest('build/css/'));

    return stream;
});

gulp.task('copy:build', function () {
    var stream = gulp.src(['src/js/*', '!src/js/Util.js'])
        .pipe(copy('build', {
            prefix : 1
        }));

    return stream;
});

gulp.task('script:target', function () {
    var _jsList = jsList,
        len = _jsList.length,
        srcList = [];

    for (var i = 0; i < len; i++) {
        var curSrc = 'build/js/' + _jsList[i] + '.js';
        try {
            fs.readFileSync(curSrc);
            srcList.push(curSrc);
        } catch (err) {
            console.log('找不到对应文件 【' + curSrc + '】');
        }
    }

    console.log('【JS合并&压缩】 List：' + srcList.join(' | '));

    var stream = gulp.src(srcList)
        .pipe(concat('H.js'))
        .pipe(gulp.dest('dev/js'))
        .pipe(rename('H.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));

    return stream;
});

gulp.task('css:target', function () {
    var _cssList = cssList,
        len = _cssList.length,
        srcList = [];

    for (var i = 0; i < len; i++) {
        var curSrc = 'build/css/' + _cssList[i] + '.css';
        try {
           fs.readFileSync(curSrc);
            srcList.push(curSrc);
        } catch (err) {
            console.log('找不到对应文件 【' + curSrc + '】');
        }
    }

    console.log('【CSS合并&压缩】 List：' + srcList.join(' | '));

    var stream = gulp.src(srcList)
        .pipe(concat('H.css'))
        .pipe(gulp.dest('dev/css'))
        .pipe(rename('H.min.css'))
        .pipe(cleancss({
            compatibility: 'ie7'//类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
        }))
        .pipe(gulp.dest('dist/css'));

    return stream;
});

gulp.task('copy:dev', function () {
    var stream = gulp.src(['src/img/*'])
        .pipe(copy('dev', {
            prefix : 1
        }));

    return stream;
});

gulp.task('copy:dist', function () {
    var stream = gulp.src(['src/img/*'])
        .pipe(copy('dist', {
            prefix : 1
        }));

    return stream;
});

gulp.task('watchDo:js', ['browserify', 'copy:build'], function () {
    gulp.start('script:target');
});

gulp.task('watchDo:css', ['less'], function () {
    gulp.start('css:target');
});

/*
 * 任务：dist 构建
 * */
gulp.task('dist', ['browserify', 'copy:build', 'less'], function () {
    gulp.start('script:target', 'css:target', 'copy:dev', 'copy:dist');
});

gulp.task('watch:js', function () {
    gulp.watch(['src/js/**/*.js'], function(event){
        console.log('File ' + event.path + ' was ' + event.type + ', running watchDo:js tasks...');
        gulp.start('watchDo:js');
    });
});

gulp.task('watch:css', function () {
    gulp.watch('src/less/**/*.less', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running watchDo:css tasks...');
        gulp.start('watchDo:css');
    });
});

gulp.task('watch:copy', function () {
    gulp.watch('src/img/*', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running copy:dist tasks...');
        gulp.start('copy:dist');
    });
});

gulp.task('watch', function () {
    gulp.start('watch:js', 'watch:css', 'watch:copy');
});

/*
 * 任务：自定义任务
 * 描述：可根据自己需要自定义常用任务
 * */
gulp.task('default', function () {
    gulp.start('dist');
});


