'use strict';
/* === Class Loader begin === */
/*
 * 此类依赖于 Jquery 和 Monitor，它的实例化一定要在这两者之后
 * 此类的作用是，根据依赖关系来异步加载 CSS，JS
 * */
var Loader = function () {
    var _this = this;
    _this.queue = {};       //未加载模块列表
    _this.loaded = {};      //已加载模块列表

    //PS：这里依赖了 Monitor 模块
    var Monitor = require('../Monitor/Monitor');
    _this.Monitor = new Monitor();
};

/*
 * 参数说明：
 * module 【Obj】【可以传多个】
 * 每个 module 对象包含了4个属性：
 * type 【String】 必传，要引入的模块类型，取值范围：“js”，“css”，“html”
 * name 【String】 必传，要引入 JS 的模块名
 * url 【String】 必传，要引入 JS 的路径
 * requires 【String Array】 可选，此脚本依赖的模块（所依赖模块的模块名组成的集合）
 * callback 【Function】 回调函数，脚本加载完后执行的回调函数
 * */
Loader.prototype.get = function () {
    var _this = this;

    for (var i = 0, argumentsLen = arguments.length; i < argumentsLen; i++) {
        var module = $.extend({}, arguments[i]);

        //查找是否已加载
        if (_this.loaded[module.name]) {
            continue;
        }

        _this.queue[module.name] = module;

        //是否依赖其他模块
        if ($.isArray(module.requires) && module.requires.length > 0) {
            var conditionArr = [];

            for (var j = 0, requiresLen = module.requires.length; j < requiresLen; j++) {
                conditionArr.push('Loader_Success_' + module.requires[j]);
            }

            var condition = conditionArr.join(',');

            _this._addListen(condition, module.name);
        }else{
            _this._execute(module);
        }
    }

    return _this;
};

/*
 * 参数说明：
 * module 【Obj】
 * 参考 get 方法关于 module 对象的详解
 * */
Loader.prototype._execute = function (module) {
    var _this = this;

    if (module.type == 'js' || module.type == 'html') {
        $.ajax({
            url: module.url,
            dataType: module.type == 'js' ? 'script' : module.type,
            context: {
                name: module.name
            },
            cache: true,
            crossDomain: true,
            success: function (res) {
                _this._loadSuccess(module, res);
            }
        });
    } else if (module.type == 'css') {
        var link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = module.url;
        link.onload = function () {
            _this._loadSuccess(module);
        };

        document.getElementsByTagName('head')[0].appendChild(link);
    }
};

/*
 * 参数说明：
 * module 【Obj】
 * 参考 get 方法关于 module 对象的详解
 * */
Loader.prototype._loadSuccess = function (module, res) {
    var _this = this;

    //标记模块已加载
    _this.loaded[module.name] = 1;
    delete _this.queue[module.name];

    if (typeof module.callback != 'undefined' && typeof module.callback == 'function') {
        module.callback( (typeof res == 'string' && module.type == 'html') ? res : undefined);
    }

    _this.Monitor.trigger('Loader_Success_' + module.name);
};

/*
 * 参数说明：
 * condition 【String】 触发条件名
 * moduleName 【String】 模块名，对应 get 方法传入对象的 name 属性
 * */
Loader.prototype._addListen = function (condition, moduleName) {
    var _this = this;

    _this.Monitor.listen(condition, function () {
        _this._execute(_this.queue[moduleName]);
    });
};

module.exports = Loader;
