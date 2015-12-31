'use strict';
/* === Class JsLoader begin === */
/*
 * 此类依赖于 Jquery 和 Monitor，它的实例化一定要在这两者之后
 * 此类的作用是，根据依赖关系来异步加载JS脚本
 * */
var JsLoader = function () {
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
 * name 【String】 必传，要引入 JS 的模块名
 * url 【String】 必传，要引入 JS 的路径
 * requires 【String Array】 可选，此脚本依赖的模块（所依赖模块的模块名组成的集合）
 * callBack 【Function】 回调函数，脚本加载完后执行的回调函数
 * */
JsLoader.prototype.get = function () {
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
                conditionArr.push('JsLoader_Success_' + module.requires[j]);
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
JsLoader.prototype._execute = function (module) {
    var _this = this;

    $.ajax({
        url: module.url,
        dataType: 'script',
        context: {
            name: module.name
        },
        cache: true,
        crossDomain: true,
        success: function () {
            //标记模块已加载
            _this.loaded[module.name] = 1;
            delete _this.queue[module.name];

            if (typeof module.callBack != 'undefined' && typeof module.callBack == 'function') {
                module.callBack();
            }

            _this.Monitor.trigger('JsLoader_Success_' + module.name);
        }
    });
};

/*
 * 参数说明：
 * condition 【String】 触发条件名
 * moduleName 【String】 模块名，对应 get 方法传入对象的 name 属性
 * */
JsLoader.prototype._addListen = function (condition, moduleName) {
    var _this = this;

    _this.Monitor.listen(condition, function () {
        _this._execute(_this.queue[moduleName]);
    });
};

module.exports = JsLoader;
