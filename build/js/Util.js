(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var Cookie = {
    options : {
        path : '/',    // 路径
        domain: ''    // 域名
    },
    /*
     * 参数说明：
     * name 【String】 Cookie名
     * value 【String】 Cookie值
     * time 【Int】 过期时长（单位：毫秒）
     * domain 【String】 Cookie域，可缺省，默认值为空字符串
     * path 【String】 Cookie路径，可缺省，默认值为 '/'
     * */
    set: function (name, value, time, domain, path) {
        var cookieArr = [],
            _path = path || this.options.path,
            _domain = domain || this.options.domain,
            expire = new Date();

        expire.setTime(expire.getTime() + time);

        cookieArr.push(name + '=' + escape(value) + '; ');
        cookieArr.push(time ? ('expires=' + expire.toGMTString() + '; ') : '');
        cookieArr.push('path=' + _path + '; ');
        cookieArr.push('domain=' + _domain + ';');
        document.cookie = cookieArr.join('');
        return true;
    },

    /*
     * 参数说明：
     * name 【String】 Cookie名
     * */
    get: function (name) {
        var reg = new RegExp('(?:^|;+|\\s+)' + name + '=([^;]*)'),
            m = document.cookie.match(reg);

        return unescape(decodeURIComponent(!m ? '' : m[1]));
    },

    /*
     * 参数说明：
     * name 【String】 Cookie名
     * domain 【String】 Cookie域，可缺省，默认值为空字符串
     * path 【String】 Cookie路径，可缺省，默认值为 '/'
     * */
    remove: function (name, domain, path) {
        var _this = this,
            cookieArr = [],
            _path = path || _this.options.path,
            _domain = domain || _this.options.domain;

        cookieArr.push(name + '=; ');
        cookieArr.push('expires=Mon, 26 Jul 1997 05:00:00 GMT; ');
        cookieArr.push('path=' + _path + '; ');
        cookieArr.push('domain=' + _domain + ';');
        document.cookie = cookieArr.join('');
    }
};

module.exports = Cookie;

},{}],2:[function(require,module,exports){
'use strict';
module.exports = function () {
    /*
     * 对Date的扩展，将 Date 转化为指定格式的String
     * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
     * 可以用 1-2 个占位符
     * 年(y) 可以用 1-4 个占位符
     * 毫秒(S) 只能用 1 个占位符(是 1-3 位的数字)
     * */
    Date.prototype.format = function (fmt) {
        var o = {
            'M+': this.getMonth() + 1, //月份
            'd+': this.getDate(), //日
            'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
            'H+': this.getHours(), //小时
            'm+': this.getMinutes(), //分
            's+': this.getSeconds(), //秒
            'q+': Math.floor((this.getMonth() + 3) / 3), //季度
            'S': this.getMilliseconds() //毫秒
        };

        var week = {
            '0': '/u65e5',
            '1': '/u4e00',
            '2': '/u4e8c',
            '3': '/u4e09',
            '4': '/u56db',
            '5': '/u4e94',
            '6': '/u516d'
        };

        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }

        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? '/u661f/u671f' : '/u5468') : '') + week[this.getDay() + '']);
        }

        for (var k in o) {
            if (new RegExp('('+ k +')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    };
};

},{}],3:[function(require,module,exports){
'use strict';
/*
 * 获取字符串的字符长度方法
 *
 * 参数说明：
 * str 【String】 需要获取字符长度的字符串
 * */
var getStrCodeLength = function (str) {
    var realLength = 0,
        len = str.length,
        charCode = -1;

    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);

        if (charCode >= 0x4e00 && charCode <= 0x9fff) {
            //如果 unicode 在汉字范围内（汉字的 unicode 码范围是 u4e00~u9fff）
            realLength += 2;
        } else {
            realLength += 1;
        }
    }

    return realLength;
};

module.exports = getStrCodeLength;

},{}],4:[function(require,module,exports){
'use strict';
/* === Class ItvEvents begin === */
/*
 * 此类依赖于Jquery
 * 此类的作用是，使得绑定在指定元素上的指定事件的触发函数产生一定执行间隔时间
 * 避免高频率触发事件时，函数随之高频率执行，以致影响应用的运行速度
 * */
var ItvEvents = function () {
    var _this = this;
    _this.lastTriggerTime = {}; //最后一次触发事件的时间点
    _this.timeOut = {};         //setTimeout对象缓存
};

/*
 * 参数说明：
 * $el 【JqueryObj】 要绑定事件的JqueryDOM对象
 * eventType 【String】 要绑定的事件类型
 * eventName 【String】 事件的命名空间
 * fn 【Function】 事件触发时要执行的函数
 * itvTime 【Int】 事件被连续触发时，对应的函数的执行间隔
 * */
ItvEvents.prototype.addEvent = function ($el, eventType, eventName, fn, itvTime) {
    var _this = this;

    _this.lastTriggerTime[eventName] = +new Date();
    _this.timeOut[eventName] = null;

    $el.on(eventType + '.' + eventName, function (e) {
        _this.itvTrigger(eventName, fn, itvTime, this, e);
    });
};

/*
 * 参数说明：
 * $el 【JqueryObj】 要绑定事件的JqueryDOM对象
 * eventType 【String】 要绑定的事件类型
 * eventName 【String】 事件的命名空间
 * */
ItvEvents.prototype.removeEvent = function ($el, eventType, eventName) {
    var _this = this;

    delete _this.lastTriggerTime[eventName], _this.timeOut[eventName];

    $el.off(eventType + '.' + eventName);
};

/*
 * 参数说明：
 * eventName 【String】 事件的命名空间
 * eventName 【Function】 事件触发时要执行的函数
 * itvTime 【Int】 事件被连续触发时，对应的函数的执行间隔
 * fnContextObj 【Obj】 事件触发时所执行函数的上下文关系变量
 * event 【Obj】 事件对象
 * */
ItvEvents.prototype.itvTrigger = function (eventName, fn, itvTime, fnContextObj, event) {
    var _this = this,
        curTriggerTime = +new Date();   //当前要触发事件的时间点

    clearTimeout(_this.timeOut[eventName]);

    if (curTriggerTime - _this.lastTriggerTime[eventName] > itvTime) {
        _this.lastTriggerTime[eventName] = curTriggerTime;
        fn.call(fnContextObj, event);
    } else {
        _this.timeOut[eventName] = setTimeout(function () {
            fn.call(fnContextObj, event);
        }, itvTime);
    }
};

module.exports = ItvEvents;

},{}],5:[function(require,module,exports){
'use strict';

var template = require('../Template/Template');//PS:这里依赖了 Template 模块

/*
 * 构造方法
 *
 * 参数说明：
 * opts 【Obj】
 * opts 对象的子属性：
 * $target 【Jquery Dom Obj】 必传，绑定延迟加载触发滚动事件的目标对象，默认为 window，通常情况下不需要修改
 * method 【String】 加载方式，默认是 fromToBottom 从下方异步插入 dom 结构，传入可选值：fromToTop、fromToBottom
 * distanceToPageBottom 【Number】 每次触发延迟加载的滚动高度，默认是 200
 * isLazyLoad 【Boolean】 是否对延迟加载内容的图片做 lazyLoad 处理，默认为 true
 * allData 【Array】 延迟加载
 * preRender 【Integer】 预加载的屏数
 * renderCb 【Function】 延迟插入的 dom 结构渲染完成后执行的回调函数
 * */
var LazyDom = function (opts) {
    var _this = this;

    _this.options = {
        $target: $(window),
        method: 'fromToBottom',
        distanceToPageBottom: 200,
        isLazyLoad: true,
        lazyLoadThreshold: 400,
        allData: [],
        preRender: 0,
        renderCb: $.noop,
        finishEvent: $.noop,

        $doc: $(document), //document 的 Jquery 对象缓存
        oldTop: 0, //上一次触发延迟加载的滚动高度
        recTop: 0,
        targetH: 0,
        dataIndex: 0
    };

    $.extend(_this.options, opts);

    _this.getTargetH();
    _this.process();
    _this.bindEvent();
    _this.scroll();
    _this.chkBegin();

    return _this;
};

/*
* 获取触发异步加载滚动事件的目标对象的高度
* */
LazyDom.prototype.getTargetH = function () {
    var options = this.options;
    options.targetH = options.$target.height();
    return options.targetH;
};

/*
 * 数据处理，获得当次异步加载所需的渲染数据
 * */
LazyDom.prototype.process = function () {
    var options = this.options,
        allData = options.allData,
        curData = allData[options.dataIndex];

    if (curData) {
        curData.data = curData.data ? curData.data : [];
        curData.dataLen = curData.data.length;
        curData.rowCountPerScreen = Math.ceil(options.targetH / curData.listItemHeight); //每屏可显示的商品行数 = 触发元素高度 / 每个商品元素的高度
        curData.renderCb = curData.renderCb ? curData.renderCb : $.noop;
    }
};

/*
 * 数据处理，提取当次异步加载所需的渲染数据
 *
 * 参数说明：
 * screenCount 【Integer】 必传，要加载的屏数
 * */
LazyDom.prototype.extract = function (screenCount) {
    var _this = this,
        options = _this.options,
        curData = options.allData[options.dataIndex];

    if (curData && curData.type !== 'callback') {

        var startIndex = curData.startIndex ? curData.startIndex : 0, //开始下标
            endIndex = startIndex + curData.rowCountPerScreen * curData.goodsCountPerRow * screenCount, //结束下标 = 开始下标 + (每屏可加载的商品行数 * 每行的商品数 * 屏数)
            sliceData = curData.data.slice(startIndex, endIndex), //截取要加载的商品数据
            retData = {
                $node: curData.$node, //需要插入 dom 元素的节点对象【用户传入】
                listItemHeight: curData.listItemHeight, //商品列表每个商品元素的高度
                rowCountPerScreen: curData.rowCountPerScreen, //每屏可显示的商品行数
                goodsCountPerRow: curData.goodsCountPerRow, //每行的商品数【用户传入】
                template: curData.template, //商品的渲染模版【用户传入】
                renderCb: curData.renderCb, //当前模块每次异步渲染完后执行的回调函数【用户传入】
                sliceData: sliceData //本次异步加载需要用到的商品数据【用户传入】
            };

        //【结束下标】变成新的【开始下标】
        curData.startIndex = endIndex;

        if (curData.startIndex >= curData.data.length) {
            //如果当前模块的数据已经加载完了
            if (options.dataIndex < options.allData.length) {
                //如果当前模块不是最后一个延迟加载模块，触发下一个模块的数据加载
                options.dataIndex++;
                _this.process();
                _this.scroll();
            }
        }

        return retData;

    } else if (curData && curData.type === 'callback') {

        curData.renderCb && curData.renderCb(curData.$node);
        if (options.dataIndex < options.allData.length) {
            //如果当前模块不是最后一个延迟加载模块，触发下一个模块的数据加载
            options.dataIndex++;
            _this.process();
            _this.scroll();
        }
        return null;

    } else {

        if (!_this.hasTriggerFinish) {
            _this.hasTriggerFinish = true;
            options.finishEvent();
            options.$target.off('scroll.lazyDom');
            options.$target.off('resize.lazyDom')
        }
        return null;

    }
};

/*
 * 生成dom，并插入到页面中
 *
 * 参数说明：
 * opts 【Obj】
 * opts 对象的子属性：
 * $node 【Jquery Dom Obj】 必传，需要插入 dom 元素的目标对象
 * sliceData 【Array】 渲染 dom 所需的数据
 * template 【String】 渲染 dom 所需的模版
 * renderCb 【Function】 dom 元素成功渲染到页面中后执行的回调函数
 * */
LazyDom.prototype.createDom = function (opts) {
    var _this = this,
        options = _this.options,
        $node = opts.$node,
        htmlArr = [],
        $createEl = null;

    for (var i = 0, len = opts.sliceData.length; i < len; i++) {
        var html = template(opts.template, opts.sliceData[i]);
        htmlArr.push(html);
    }

    $createEl = $(htmlArr.join(''));

    $node.append($createEl);
    opts.renderCb($node, $createEl);
    options.renderCb($node, $createEl);

    if (options.isLazyLoad && typeof $.fn.lazyload == 'function') {
        $createEl.find('img.lazy').lazyload({
            threshold: options.lazyLoadThreshold
        });
    }
};

/*
 * 滚动事件的回调函数，根据滚动后的页面状况，判断是否触发 dom 异步加载
 * */
LazyDom.prototype.scroll = function () {
    var _this = this,
        options = _this.options,
        newTop = options.$target.scrollTop(),
        docH = options.$doc.height();

    if (options.method == 'fromToTop') {

        if (newTop > options.oldTop) {

            var scrollHeight = newTop - options.recTop;

            if (scrollHeight > options.targetH) {

                var len = Math.floor(scrollHeight / options.targetH);
                if (docH - newTop < options.targetH) {
                    len = len + 1;
                }

                var extractData = _this.extract(len);
                if (extractData) {
                    _this.createDom(extractData);
                }

                options.recTop = newTop;

            }

            options.oldTop = newTop;

        }

    } else if (options.method == 'fromToBottom') {

        if (docH - newTop - options.targetH <= options.distanceToPageBottom) {

            var extractData = _this.extract(1);
            if (extractData) {
                _this.createDom(extractData);
            }
        }

    }

};

/*
 * 绑定 dom 延迟加载触发事件
 * */
LazyDom.prototype.bindEvent = function () {
    var _this = this,
        options = _this.options;

    options.$target.on('scroll.lazyDom', function () {
        _this.scroll();
    });

    options.$target.on('resize.lazyDom', function () {
        _this.getTargetH();
        _this.process();
        _this.scroll();
    });
};

/*
 * 检测页面初始化时是否需要触发加载
 * */
LazyDom.prototype.chkBegin = function () {
    var _this = this,
        options = _this.options,
        winH = options.$target.height(),
        docH = options.$doc.height();

    if (options.preRender && !_this.preRenderDone) {
        var sliceData = _this.extract(options.preRender);
        if (sliceData) {
            _this.createDom(sliceData);
            _this.preRenderDone = true;
        }
    }

    if (options.method == 'fromToTop') {
        if (docH < winH * 2) {
            var sliceData = _this.extract(1);
            if (sliceData) {
                setTimeout(function() {
                    _this.createDom(sliceData);
                    _this.chkBegin();
                }, 1);
            }
        }
    }
};

/*
 * 解绑 dom 延迟加载触发事件
 * */
LazyDom.prototype.destroy = function() {
    this.options.$target.off('scroll.lazyDom').off('resize.lazyDom')
};

module.exports = LazyDom;

},{"../Template/Template":16}],6:[function(require,module,exports){
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

},{"../Monitor/Monitor":10}],7:[function(require,module,exports){
'use strict';
var Loading = {
    template: '<div id="J-h-loading" class="ui-loading"></div>',
    show: function () {
        var _this = this;
        $('body').append(_this.template);
    },
    hide: function () {
        $('#J-h-loading').remove();
    }
};

module.exports = Loading;

},{}],8:[function(require,module,exports){
'use strict';
/* === Class DelayedFunc begin === */
/*
 用 DelayedFunc 类创建的对象包含5属性
 func 【function】 需要触发的函数实体
 allowCount 【int】 已经成功触发的条件数
 conditionCount 【int】 需要触发的条件数
 allowFlag 【bool】 该函数的所有触发条件都已经触发了，其值就为true，否则其值就为false
 conditionStatusList 【Obj】 此对象包含的子属性的数目将等于conditionCount的值，这n个属性的属性名和触发条件名相同
 */
var DelayedFunc = function (func, conditionCount) {
    var _this = this;
    _this.func = [];
    _this.conditionCount = conditionCount;
    _this.allowCount = 0;
    _this.allowFlag = false;
    _this.conditionStatusList = {};

    _this.func.push(func);
};

DelayedFunc.prototype.checkStatus = function () {
    var _this = this;

    if (_this.allowFlag) {
        return true;
    }

    if (_this.allowCount === _this.conditionCount) {
        _this.allowFlag = true;
        return true;
    }

    return false;
};

module.exports = DelayedFunc;
},{}],9:[function(require,module,exports){
'use strict';
var DelayedFunc = require('./DelayedFunc');

/* === Class FuncDepot begin === */
var FuncDepot = function (parent) {
    var _this = this;
    _this.parent = parent;
    //初始化触发条件列表
    _this.conditionList = {};
    //初始化函数库存列表
    _this.stockList = {};
    //初始化参数库存列表
    _this.paramList = {};
};

/*
 * 参数说明：
 * condition 【Array】 触发条件list
 * func 【function】 满足触发条件时，需要触发的函数
 * */
FuncDepot.prototype.stockPush = function (condition, func) {
    var _this = this,
        condition_length = condition.length,
        curStock = null,
        _condition = [],
        stockName = '',
        curParam = {},
        triggerHash = _this.parent.triggerHash,
        triggerHash_length = triggerHash.length;

    for (var i = 0; i < condition_length; i++) {
        _condition.push('^' + condition[i] + '^');
    }

    for (var i = 0; i < triggerHash_length; i++) {
        if ($.inArray(triggerHash[i], condition) != -1 && typeof _this.paramList[triggerHash[i]] != 'undefined') {
            $.extend(curParam, _this.paramList[triggerHash[i]]);
        }
    }

    stockName = _condition.join('|@|');

    if (typeof _this.stockList[stockName] === 'undefined') {

        /*
         如果指定的库存函数对象不存在，就在函数库存列表中插入一个新的库存函数对象
         同时定义一个局部变量，缓存该对象（当前库存函数对象），以便后面的代码快速引用它
         */
        curStock = _this.stockList[stockName] = new DelayedFunc(func, condition_length);

    } else {

        //如果指定的库存函数对象已经存在，直接引用它
        curStock = _this.stockList[stockName];
        curStock.func.push(func);

    }

    if (curStock.allowFlag) {

        //当前库存函数对象 的函数触发标记为true时，直接触发函数
        curStock.func[curStock.func.length - 1].call(window, curParam);

    } else {

        //遍历触发条件list
        for (var i = 0; i < condition_length; i++) {

            var curCondition = condition[i];
            //如果触发条件列表（conditionList）中，对应的触发条件的值为true（该条件已经被触发）
            if (_this.conditionList[curCondition] === true) {

                //为 当前库存函数对象 插入条件属性，并设置其值为true
                if (!curStock.conditionStatusList[curCondition]) {
                    curStock.allowCount++;
                }
                curStock.conditionStatusList[curCondition] = true;


            } else {

                //否则，为 当前库存函数对象 插入条件属性，并设置其值为false
                curStock.conditionStatusList[curCondition] = false;

            }

        }

        if (curStock.checkStatus()) {

            //该函数的所有触发条件都已经触发了
            curStock.func[curStock.func.length - 1].call(window, curParam);

        }

    }
};

/*
 * 参数说明：
 * condition 【Array】 触发条件list
 * params 【obj】 满足触发条件时，传给触发的函数的公共参数
 * */
FuncDepot.prototype.stockTrigger = function (condition, params) {
    var _this = this,
        stockItem;

    if (typeof params != 'undefined' && params.constructor == Object) {
        _this.paramList[condition] = params;
    }

    //遍历函数库存列表
    for (stockItem in _this.stockList) {

        //进行库存函数名称匹配，如果库存函数名含有与某个触发条件相同的字符，说明该库存函数含有此触发条件
        if (stockItem.indexOf('^' + condition + '^') !== -1) {

            var curStock = _this.stockList[stockItem],
                curParam = _this.paramList[condition];

            for (var item in curStock.conditionStatusList) {
                if (typeof _this.paramList[item] != 'undefined' && item != condition) {
                    curParam = $.extend({}, _this.paramList[item], curParam);
                }
            }

            if (curStock.allowFlag) {

                //如果该函数的所有触发条件都已经满足，直接触发该函数
                for (var i = 0, len = curStock.func.length; i < len; i++) {
                    curStock.func[i].call(window, curParam);
                }

            } else {

                //该函数并未所有触发条件满足，且当前正在触发的条件正是未被触发的
                if (typeof curStock.conditionStatusList[condition] != 'undefined' && !curStock.conditionStatusList[condition]) {

                    //将该函数的对应触发条件设为true（已触发)
                    if (!curStock.conditionStatusList[condition]) {
                        //已触发条件数+1
                        curStock.allowCount++;
                    }
                    curStock.conditionStatusList[condition] = true;

                }

                //触发条件相关属性变更完后，判断已触发条件数是否与需要触发的条件数相同，如果相同，则所有触发条件都已触发
                if (curStock.checkStatus()) {

                    //所有触发条件都已触发，allowFlag属性设为true，并直接执行该函数
                    for (var i = 0, len = curStock.func.length; i < len; i++) {
                        curStock.func[i].call(window, curParam);
                    }

                }

            }

        }

    }
};

/*
 * 参数说明：
 * condition 【Array】 触发条件list
 * */
FuncDepot.prototype.stockPop = function (condition) {
    var _this = this,
        condition_length = condition.length,
        _condition = [],
        stockName = '';

    for (var i = 0; i < condition_length; i++) {
        _condition.push('^' + condition[i] + '^');
    }

    stockName = _condition.join('|@|');

    if (typeof _this.stockList[stockName] != 'undefined') {
        delete _this.stockList[stockName];
    }
};

module.exports = FuncDepot;
},{"./DelayedFunc":8}],10:[function(require,module,exports){
'use strict';
var FuncDepot = require('./FuncDepot');

/* === Class Monitor begin === */
/*
 * 此类依赖于Jquery
 * */
var Monitor = function () {
    var _this = this;
    _this.triggerHash = [];
    _this.funcDepot = new FuncDepot(_this);
};

/*
 * 参数说明：
 * condition 【String】
 * 触发条件list的表达字符串，各个条件由英文逗号','分隔开
 * 字符串中的所有空格符都会被过滤掉，建议仅用英文和数字组织触发条件名
 * func 【function】 满足触发条件时，需要触发的函数
 * */
Monitor.prototype.listen = function (condition, func) {
    var _this = this,
        _condition = condition.replace(/ /g, '').split(',');

    for (var i = 0, j = _condition.length; i < j; i++) {

        var curCondition = _condition[i];
        //如果该触发条件并未加入触发条件列表中
        if (!_this.funcDepot.conditionList[curCondition]) {

            //将该触发条件插入到触发条件列表，触发条件的值为false（未触发）
            _this.funcDepot.conditionList[curCondition] = false;

        }

    }

    _this.funcDepot.stockPush(_condition, func);
};

/*
 * 参数说明：
 * condition 【String】
 * 触发条件名
 * 字符串中的所有空格符都会被过滤掉，建议仅用英文和数字组织触发条件名
 * params 【obj】
 * 满足触发条件时，传给触发的函数的公共参数
 * 多个触发条件分开触发时，分别传入的 params 参数对象将会合并（extend）
 * */
Monitor.prototype.trigger = function (condition, params) {
    var _this = this,
        flag = $.inArray(condition, _this.triggerHash);

    if (flag != -1) {
        _this.triggerHash.splice(flag, 1);
    }

    _this.triggerHash.push(condition);
    //如果触发条件列表中包含此触发条件，就会直接将其设为true
    //如果触发条件列表中不包含此触发条件，则会将该触发条件插入到触发条件列表，触发条件的值为true（已触发）
    _this.funcDepot.conditionList[condition] = true;

    _this.funcDepot.stockTrigger(condition, params);
};

/*
 * 参数说明：
 * condition 【String】
 * 触发条件list的表达字符串，各个条件由英文逗号','分隔开
 * 字符串中的所有空格符都会被过滤掉，建议仅用英文和数字组织触发条件名
 * */
Monitor.prototype.unListen = function (condition) {
    var _this = this,
        _condition = condition.replace(/ /g, '').split(',');

    _this.funcDepot.stockPop(_condition);
};

module.exports = Monitor;
},{"./FuncDepot":9}],11:[function(require,module,exports){
'use strict';
/* === Class Pager begin === */
/*
 * 此类依赖于Jquery
 *
 * Pager分页模板可用数据的格式
 * ｛
 *      total: 180,
 *      apg: 1,
 *      pgc: 18,
 *      ps: 10,
 *      els: [｛
 *          pg: 1,
 *          name: 1,
 *          cls: 'ui-pager-active'
 *      ｝,｛
 *          pg: 2,
 *          name: 2,
 *          cls: 'ui-pager-can'
 *      ｝]
 * ｝
 *
 * 数据字段说明：
 * total —— 记录总条数
 * apg —— 当前页
 * pac —— 总页数
 * ps —— 每页显示条数
 * els —— 页码元素list
 * els|pg —— 点击页码要跳转到的页数（可能为空，空则不进行换页）
 * els|name —— 页码元素的内容（文字）
 * els|cls —— 页码元素的 css class
 * */
var Pager = function (opts) {
    var _this = this;

    _this.bindEventFlag = true; //事件是否已绑定标记
    _this.tplT = opts.tplT || null; //上分页模板（列表上方的简单分页）
    _this.tplB = opts.tplB || null; //下分页模板（列表下方的常规分页）
    _this.wrapT = opts.wrapT || null; //上分页容器（列表上方的简单分页）
    _this.wrapB = opts.wrapB || null; //下分页容器（列表上方的简单分页）
    _this.goToPageFunc = opts.goToPageFunc || null; //分页跳转回调

    //可点击的页码的class
    _this.canClkCls = opts.canClkCls || 'ui-pager-can';
    //不可点击的页码的class
    _this.cantClkCls = opts.cantClkCls || 'ui-pager-cant';
    //当前页码的class
    _this.activeCls = opts.activeCls || 'ui-pager-active';

    return _this;
};

/*
 * 分页模块渲染方法
 * 参数说明：
 * options type｛obj｝
 *
 * 属性
 * pg 【Int,Int-String】 当前页页码
 * total 【Int,Int-String】 数据总数
 * ps 【Int,Int-String】 每页条数
 * */
Pager.prototype.render = function (options) {
    var _this = this,
        pageData = _this.transformOpts(options),
        template = require('../Template/Template'),//PS:这里依赖了 Template 模块
        contT = _this.tplT ? template(_this.tplT, {
            total: pageData['total'],
            apg: pageData['pg'],
            pgc: pageData['page_count'],
            ps: pageData['ps'],
            els: pageData['simple_page_els']
        }) : '',
        contB = _this.tplB ? template(_this.tplB, {
            total: pageData['total'],
            apg: pageData['pg'],
            pgc: pageData['page_count'],
            ps: pageData['ps'],
            els: pageData['page_els']
        }) : '';

    _this.wrapT && _this.wrapT.html(contT);
    _this.wrapB && _this.wrapB.html(contB);

    if (_this.bindEventFlag) {
        //如果还没绑定事件
        _this.bindEvents();
    }
};

/*
 * 分页数据生产方法
 * 参数说明：
 * options type｛obj｝
 *
 * 属性
 * pg 【Int,Int-String】 当前页页码
 * total 【Int,Int-String】 数据总数
 * ps 【Int,Int-String】 每页条数
 * */
Pager.prototype.transformOpts = function (options) {
    var _this = this,
        pg = options.pg * 1,
        pageCount = Math.ceil(options.total / options.ps),
        simplePageEls = [],
        pageEls = [],
        canClkCls = _this.canClkCls,
        cantClkCls = _this.cantClkCls,
        activeCls = _this.activeCls;

    if (pageCount < 9) {
        //总页数小于9页
        for (i = 1; i <= pageCount; i++) {
            pageEls.push({
                pg: i,
                name: i,
                cls: canClkCls
            });
        }
    } else {
        //总页数大于或等于9页
        if (pg < 4) {
            //小于第4页
            if (pg !== 1) {
                //不是第1页
                pageEls.unshift({
                    pg: pg - 1,
                    name: '&lt;',
                    cls: canClkCls
                },{
                    pg: 1,
                    name: 1,
                    cls: canClkCls
                });
            } else {
                //是第1页
                pageEls.unshift({
                    pg: '',
                    name: '&lt;',
                    cls: cantClkCls
                },{
                    pg: 1,
                    name: 1,
                    cls: canClkCls
                });
            }

            //插入第2页到第6页
            for (var i = 2; i <= pg + 3; i++) {
                pageEls.push({
                    pg: i,
                    name: i,
                    cls: canClkCls
                });
            }

            //插入省略号，最后一页，下一页
            pageEls.push({
                pg: '',
                name: '...',
                cls: cantClkCls + ' ui-pager-dot'
            },{
                pg: pageCount,
                name: pageCount,
                cls: canClkCls
            },{
                pg: pg + 1,
                name: '&gt;',
                cls: canClkCls
            });
        } else {
            //大于等于第4页

            //在数组最前端插入上一页，1页
            pageEls.unshift({
                pg: pg - 1,
                name: '&lt;',
                cls: canClkCls
            },{
                pg: 1,
                name: 1,
                cls: canClkCls
            });

            var num = 2;
            if (pg != 4) {
                //不是第四页，插入省略号
                pageEls.push({
                    pg: '',
                    name: '...',
                    cls: cantClkCls + ' ui-pager-dot'
                });

                if (pageCount - 3 != pg) {
                    num = 3;
                }
            }

            for (var i = num; i >= 0; i--) {
                pageEls.push({
                    pg: pg - i,
                    name: pg - i,
                    cls: canClkCls
                });
            }

            if (pg + 3 < pageCount) {
                //当前页距最后一页还有大于3页
                pageEls.push({
                    pg: pg + 1,
                    name: pg + 1,
                    cls: canClkCls
                },{
                    pg: pg + 2,
                    name: pg + 2,
                    cls: canClkCls
                },{
                    pg: '',
                    name: '...',
                    cls: cantClkCls + ' ui-pager-dot'
                },{
                    pg: pageCount,
                    name: pageCount,
                    cls: canClkCls
                },{
                    pg: pg + 1,
                    name: '&gt;',
                    cls: canClkCls
                });
            } else {
                //当前页距最后一页还有小于或等于3页
                for (i = pg + 1; i <= pageCount; i++) {
                    pageEls.push({
                        pg: i,
                        name: i,
                        cls: canClkCls
                    });
                }

                if (pg !== pageCount) {
                    pageEls.push({
                        pg: pg + 1,
                        name: '&gt;',
                        cls: canClkCls
                    });
                } else {
                    pageEls.push({
                        pg: '',
                        name: '&gt;',
                        cls: cantClkCls
                    });
                }
            }
        }
    }

    for (var i = 0, len = pageEls.length; i < len; i++) {
        if (pageEls[i]['pg'] == pg) {
            pageEls[i]['cls'] = pageEls[i]['cls'] + ' ' + activeCls;
            pageEls[i]['pg'] = '';
        }
    }

    simplePageEls.push({
        pg: pg == 1 ? '' : pg - 1,
        name: '&lt;',
        cls: pg == 1 ? canClkCls + ' ' + activeCls : canClkCls
    },{
        pg: pg == pageCount ? '' : pg + 1,
        name: '&gt;',
        cls: pg == pageCount ? canClkCls + ' ' + activeCls : canClkCls
    });

    options['page_els'] = pageEls;
    options['simple_page_els'] = simplePageEls;
    options['page_count'] = pageCount;

    return options;
};

/*
 * 事件绑定方法
 * */
Pager.prototype.bindEvents = function () {
    var _this = this;
    _this.wrapT && _this.wrapT
        .on('click', '.J-page-to', function () {
            var pg = $(this).data('pg');
            if (pg) {
                _this.goToPageFunc(pg);
            }
        });

    _this.wrapB && _this.wrapB
        .on('click', '.J-page-to', function () {
            var pg = $(this).data('pg');
            if (pg) {
                _this.goToPageFunc(pg);
            }
        })
        .on('click', '.J-page-go-btn', function (e) {
            var $this = $(this),
                pg = _this.wrapB.find('input.J-page-go-input').val() * 1,
                curPg = $this.data('curPage') * 1,
                maxPg = $this.data('maxPage') * 1;

            if (!isNaN(pg)) {
                var _pg = pg > maxPg ? maxPg : (pg < 1 ? 1 : pg);
                if (_pg != curPg) {
                    _this.goToPageFunc(_pg);
                }
            }
        });

    _this.bindEventFlag = false;
};

module.exports = Pager;

},{"../Template/Template":16}],12:[function(require,module,exports){
'use strict';
/*
 * 参数说明：
 * value 【All】 需要转换成价格的值，可以是任意数据类型
 * */
var parsePrice = function (value) {
    if (typeof value != 'number' && typeof value != 'string') return;
    var _value = value * 1;
    if (isNaN(_value)) return;
    return _value.toFixed(2);
};

module.exports = parsePrice;

},{}],13:[function(require,module,exports){
'use strict';
/* === Class Storage begin === */
var Storage = function () {
    var _this = this;
    _this.LS_flag = !!window.localStorage;

    if (_this.LS_flag) {
        _this.storage = window.localStorage;
    } else {
        _this.storage = null;
        _this.hostName = 'storageForOldBrowser';

        try {
            _this.storage = document.createElement('INPUT');
            _this.storage.type = 'hidden';
            _this.storage.style.display = 'none';
            _this.storage.addBehavior ('#default#userData');
            document.body.appendChild(_this.storage);
            var expires = new Date();
            expires.setDate(expires.getDate() + 365);
            _this.storage.expires = expires.toUTCString();
        } catch(e) {
            console && console.info('Storage Object create error!');
        }
    }
};

/*
 * 参数说明：
 * key 【String】 目标键名
 * */
Storage.prototype.get = function (key) {
    var _this = this;

    if (_this.storage) {

        if (_this.LS_flag) {
            return _this.storage.getItem(key);
        } else {
            _this.storage.load(_this.hostName);
            var value = _this.storage.getAttribute(key);

            if (value === null || value === undefined) {
                value = '';
            }
            return value;
        }

    }
};

/*
 * 参数说明：
 * key 【String】 目标键名（为了避免在IE6上产生报错，请不要以数字或特殊符号作为键名开头）
 * value 【String】 要设置的值
 * */
Storage.prototype.set = function (key, value) {
    var _this = this;

    if (_this.storage) {

        if (_this.LS_flag) {
            _this.storage.setItem(key, value);
        } else {
            _this.storage.load(_this.hostName);
            _this.storage.setAttribute(key, value);
            _this.storage.save(_this.hostName);
        }

    }
};

/*
 * 参数说明：
 * key 【String】 目标键名
 * */
Storage.prototype.remove = function (key) {
    var _this = this;

    if (_this.storage) {

        if (_this.LS_flag) {
            _this.storage.removeItem(key);
        } else {
            _this.storage.load(_this.hostName);
            _this.storage.removeAttribute(key);
            _this.storage.save(_this.hostName);
        }

    }
};

module.exports = Storage;

},{}],14:[function(require,module,exports){
'use strict';
/*
 * 根据字符长度截字方法
 *
 * 此方法依赖Jquery
 *
 * 参数说明：
 * str 【String】 需要处理的字符串
 * codeLength 【Int】 需求截字的长度
 * flag 【Bool】 是否要保留头尾空格符，默认值为 false
 * EnglishType 【Bool】 是否开启英文截字模式（英文截字模式下，截字末尾如果将单词截断了，就会把末尾被截断的单词部分也去除掉），默认值为 false。
 *
 * 【PS：EnglishType 参数放在最后，因为在中文环境，如果将 EnglishType 设置为 true，会出现意想不到的结果。因此中文环境下使用此参数需慎重】
 * */
var subStrByCode = function (str, codeLength, flag, EnglishType) {
    var _str = str,
        realLength = 0,
        len = _str.length,
        charCode = -1,
        endStr = '',
        cut = function (curCodeLength, endFlag) {
            var _endFlag = endFlag;
            if (EnglishType) {
                _endFlag++;
            }
            if (curCodeLength == (codeLength - 3)) {
                _str = _str.substring(0, _endFlag);
                return true;
            } else if (curCodeLength > (codeLength - 3)) {
                _str = _str.substring(0, _endFlag - 1);
                return true;
            }

            return false;
        };

    for (var i = 0; i < len; i++) {
        charCode = _str.charCodeAt(i);

        if (charCode >= 0x4e00 && charCode <= 0x9fff) {
            //如果 unicode 在汉字范围内（汉字的 unicode 码范围是 u4e00~u9fff）
            realLength += 2;
        } else {
            realLength += 1;
        }

        if (cut(realLength, i + 1)) {
            break;
        }
    }

    if (i < len && _str != '') {
        endStr = '...';
    } else {
        endStr = '';
    }

    if (EnglishType) {
        var _strArr = _str.split(' ');
        _strArr.length > 1 && _strArr.pop();
        _str = _strArr.join(' ');
    }

    return flag ? _str + endStr : $.trim(_str) + endStr;
};

module.exports = subStrByCode;

},{}],15:[function(require,module,exports){
'use strict';
//class Switchable 【依赖于Jquery】
var Switchable = function (options) {
    var _this = this;
    _this.defaults = {
        curTarget: 1,               //当前所在的分区
        count: 0,                   //分区数
        effect: 'slideX',           //切换效果
        autoPlay: true,             //自动播放
        interval: 3000,             //自动播放时间间隔
        overPause: false,           //覆盖暂停
        activeIndex: 1,             //开始步点
        delay: 500,                 //触发延迟时间
        activeCls: 'active',        //触发器选中样式
        nodeDom: null,              //hover时，停止轮播的触发元素
        prevDom: null,              //上一步DOM元素
        nextDom: null,              //下一步DOM元素
        panelDom: null,             //滚动层DOM
        triggerDom: null,           //触发器DOM
        triggerDomEvent: 'click',   //触发器DOM触发事件类型
        trigger: 'click',           //触发事件类型
        allowTrigger: true,         //切换分区开关
        itvObj: null,               //计时器缓存
        scrollTriggerDom: false     //是否开启触发器DOM滚动
    };
    _this.options = $.extend(_this.defaults, options);
    return _this;
};

//method 初始化
Switchable.prototype.init = function () {
    var _this = this,
        options = _this.options,
        panelDomChildren = options.panelDom.children();

    options.count = panelDomChildren.length;

    if (options.count > 1) {
        _this.bindTriggerEvent();    //绑定按钮事件

        //绑定事件
        switch (options.effect) {
            case 'slideX':
                //设置横向滑动距离
                _this.setScrollDistanceX();
                panelDomChildren.clone()
                    .appendTo(options.panelDom);
                break;
            case 'slideY':
                //设置纵向滑动距离
                _this.setScrollDistanceY();
                panelDomChildren.clone()
                    .appendTo(options.panelDom);
                break;
            case 'fadeX':
                //设置横向滑动距离
                _this.setScrollDistanceX();
                options.panelDom.children().css({
                    'position': 'absolute',
                    'display': 'none'
                }).eq(0).show();
                break;
            case 'fadeY':
                //设置纵向滑动距离
                _this.setScrollDistanceY();
                options.panelDom.children().css({
                    'position': 'absolute',
                    'display': 'none'
                }).eq(0).show();
                break;
            default:
                break;
        }

        if (options.effect.indexOf('X') != -1 && options.scrollDistance * options.count < options.panelDom.parent().width()
            || options.effect.indexOf('Y') != -1 && options.scrollDistance * options.count < options.panelDom.parent().height()) {
            return;
        }

        options.triggerDom && options.triggerDom.children()
            .on(options.triggerDomEvent + '.Switchable', function () {
                var $this = $(this),
                    count = options.count,
                    i = ($this.index() + 1) % count,
                    curTargetFlag = options.curTarget % count,
                    j;

                i = (i == 0) ? count : i;
                curTargetFlag = (curTargetFlag == 0) ? count : curTargetFlag;

                if (i != curTargetFlag) {
                    j = options.curTarget + i - curTargetFlag;
                    _this.switchTo(j);
                }

                $this.addClass(options.activeCls)
                    .siblings()
                    .removeClass(options.activeCls);
            })
            .eq(options.activeIndex - 1)
            .trigger('click.Switchable');

        //是否自动播放
        if (options.autoPlay) {
            var proxyEvt = $.proxy(_this.next, _this);
            options.itvObj = setInterval(proxyEvt, options.interval);

            if (options.nodeDom == null) {
                options.nodeDom = options.panelDom;
            }

            options.nodeDom.on({
                'mouseenter': function () {
                    clearInterval(options.itvObj);
                },
                'mouseleave': function () {
                    clearInterval(options.itvObj);
                    options.itvObj = setInterval(proxyEvt, options.interval);
                }
            });
        }
    }

    return _this;
};

//method 重置
Switchable.prototype.reset = function () {
    var _this = this,
        options = _this.options,
        count = options.count,
        targetFlag = options.curTarget % count,
        left;

    if (options.count > 1) {
        clearInterval(options.itvObj);
        options.itvObj = null;

        switch (options.effect) {
            case 'slideX':
                //设置横向滑动距离
                _this.setScrollDistanceX();
                break;
            case 'slideY':
                //设置纵向滑动距离
                _this.setScrollDistanceY();
                break;
            case 'fadeX':
                //设置横向滑动距离
                _this.setScrollDistanceX();
                break;
            case 'fadeY':
                //设置纵向滑动距离
                _this.setScrollDistanceY();
                break;
            default:
                break;
        }

        if (targetFlag == 0) {
            left = (count - 1) * options.scrollDistance;
        } else {
            left = (targetFlag - 1) * options.scrollDistance;
        }

        options.panelDom.css({
            'left': -left
        });

        if (options.autoPlay) {
            var proxyEvt = $.proxy(_this.next, _this);
            options.itvObj = setInterval(proxyEvt, options.interval);
        }
    }

    return _this;
};

//method 设置横向滑动距离
Switchable.prototype.setScrollDistanceX = function () {
    var _this = this,
        options = _this.options,
        panelDomChildren = options.panelDom.children(),
        triggerDomChildren = options.triggerDom != null ? options.triggerDom.children() : $(''),
        childML,
        childMR;

    childML = panelDomChildren.eq(0).css('marginLeft');
    childMR = panelDomChildren.eq(0).css('marginRight');

    options.scrollDistance = panelDomChildren.eq(0).outerWidth()
        + parseInt(childML != 'auto' ? childML : 0)
        + parseInt(childMR != 'auto' ? childMR : 0);

    //设置滚动层的宽度
    options.panelDom.width(options.scrollDistance * options.count * 2);

    if (options.scrollTriggerDom) {
        //如果触发区开启了滚动支持
        childML = triggerDomChildren.eq(0).css('marginLeft');
        childMR = triggerDomChildren.eq(0).css('marginRight');

        options.trigger_scrollDistance = triggerDomChildren.eq(0).outerWidth()
            + parseInt(childML != 'auto' ? childML : 0)
            + parseInt(childMR != 'auto' ? childMR : 0);

        options.showTriggerCount = Math.ceil(options.triggerDom.parent().width() / options.trigger_scrollDistance);
        options.scrollTriggerCount = 0;
        if (options.count <= options.showTriggerCount) {
            options.scrollTriggerDom = false;
        }
    }
};

//method 设置纵向滑动距离
Switchable.prototype.setScrollDistanceY = function () {
    var _this = this,
        options = _this.options,
        panelDomChildren = options.panelDom.children(),
        triggerDomChildren = options.triggerDom != null ? options.triggerDom.children() : $(''),
        childMT,
        childMB;

    childMT = panelDomChildren.eq(0).css('marginTop');
    childMB = panelDomChildren.eq(0).css('marginBottom');

    options.scrollDistance = panelDomChildren.eq(0).outerHeight()
        + parseInt(childMT != 'auto' ? childMT : 0)
        + parseInt(childMB != 'auto' ? childMB : 0);

    //设置滚动层的宽度
    options.panelDom.height(options.scrollDistance * options.count * 2);

    if (options.scrollTriggerDom) {
        //如果触发区开启了滚动支持
        childMT = triggerDomChildren.eq(0).css('marginTop');
        childMB = triggerDomChildren.eq(0).css('marginBottom');

        options.trigger_scrollDistance = triggerDomChildren.eq(0).outerHeight()
            + parseInt(childMT != 'auto' ? childMT : 0)
            + parseInt(childMB != 'auto' ? childMB : 0);

        options.showTriggerCount = Math.ceil(options.triggerDom.parent().height() / options.trigger_scrollDistance);
        options.scrollTriggerCount = 0;
        if (options.count <= options.showTriggerCount) {
            options.scrollTriggerDom = false;
        }
    }
};

//method 绑定按钮事件
Switchable.prototype.bindTriggerEvent = function () {
    var _this = this,
        options = _this.options;

    options.nextDom && options.nextDom.on(options.trigger + '.Switchable', $.proxy(_this.next, _this));
    options.prevDom && options.prevDom.on(options.trigger + '.Switchable', $.proxy(_this.prev, _this));

    return _this;
};

//method 滑到指定的分区
Switchable.prototype.switchTo = function (i) {
    var _this = this;
    _this.animate(_this.options.effect, i);

    return _this;
};

Switchable.prototype.animate = function (type, i) {
    var _this = this,
        options = _this.options;

    var count = options.count,
        targetFlag = i % count,
        animateCallBack,
        direction = type.indexOf('X') != -1 ? 'left' : 'top',
        distance,
        triggerDistance;

    if (i > options.curTarget) {
        //前进
        if (targetFlag == 1) {
            animateCallBack = function () {
                options.panelDom.css(direction, 0);
                options.allowTrigger = true;
            };
        } else {
            animateCallBack = function () {
                options.allowTrigger = true;
                return;
            };
        }

        if (targetFlag == 1) {
            distance = count * options.scrollDistance;
        } else if (targetFlag == 0) {
            distance = (count - 1) * options.scrollDistance;
        } else {
            distance = (targetFlag - 1) * options.scrollDistance;
        }

        options.allowTrigger = false;

        var animateParam = {};
        animateParam[direction] = -distance;

        if (type.indexOf('slide') != -1) {
            options.panelDom.stop(true, false).animate(animateParam, 300, animateCallBack);
        } else {
            options.panelDom.children()
                .eq((options.curTarget - 1) % count)
                .fadeOut(300)
                .end()
                .eq(options.curTarget % count)
                .fadeIn(300, function () {
                    options.allowTrigger = true;
                });
        }

        if (options.scrollTriggerDom) {
            //如果触发区开启了滚动支持
            if (targetFlag == 0 && options.scrollTriggerCount < count - options.showTriggerCount) {
                options.scrollTriggerCount = count - options.showTriggerCount;
            } else if (targetFlag - options.showTriggerCount > 0 && options.scrollTriggerCount < targetFlag - options.showTriggerCount) {
                options.scrollTriggerCount = targetFlag - options.showTriggerCount;
            } else if (targetFlag == 1) {
                options.scrollTriggerCount = 0;
            }
            triggerDistance = options.trigger_scrollDistance * options.scrollTriggerCount;

            var animateParam = {};
            animateParam[direction] = -triggerDistance;
            options.triggerDom.stop(true, false).animate(animateParam, 200);
        }

        //给触发按钮加上class
        _this.triggerAddCls(!targetFlag ? count : targetFlag);
        options.curTarget = i;

    } else if (i < options.curTarget) {
        //后退
        if (targetFlag == 0) {
            distance = (count - 1) * options.scrollDistance;
        } else {
            distance = (targetFlag - 1) * options.scrollDistance;
        }

        if (targetFlag == 0 && type.indexOf('slide') != -1) {
            options.panelDom.css(direction, -count * options.scrollDistance);
        }

        options.allowTrigger = false;

        var animateParam = {};
        animateParam[direction] = -distance;


        if (type.indexOf('slide') != -1) {
            options.panelDom.stop(true, false).animate(animateParam, 300, function () {
                options.allowTrigger = true;
            });
        } else {
            options.panelDom.children()
                .eq((options.curTarget - 1) % count)
                .fadeOut(300)
                .end()
                .eq((options.curTarget - 2) % count)
                .fadeIn(300, function () {
                    options.allowTrigger = true;
                });
        }

        if (options.scrollTriggerDom) {
            //如果触发区开启了滚动支持
            if (targetFlag == 0 && options.scrollTriggerCount < count - options.showTriggerCount) {
                options.scrollTriggerCount = count - options.showTriggerCount;
            } else if (targetFlag < count - options.showTriggerCount + 1 && options.scrollTriggerCount > targetFlag - 1) {
                options.scrollTriggerCount = targetFlag - 1;
            }

            triggerDistance = options.trigger_scrollDistance * options.scrollTriggerCount;

            var animateParam = {};
            animateParam[direction] = -triggerDistance;
            options.triggerDom.stop(true, false).animate(animateParam, 200);
        }

        //给触发按钮加上class
        _this.triggerAddCls(!targetFlag ? count : targetFlag);
        options.curTarget = (i == 0) ? _this.defaults.count : i;
    }
};

//method 为当前触发器添加样式
Switchable.prototype.triggerAddCls = function (i) {
    var _this = this,
        options = _this.options;

    options.triggerDom && options.triggerDom
        .children()
        .eq(i - 1)
        .addClass(options.activeCls)
        .siblings()
        .removeClass(options.activeCls);
};

//method 滑到上一分区
Switchable.prototype.prev = function () {
    var _this = this,
        options = _this.options,
        i = options.curTarget;

    if (options.allowTrigger) {
        i--;
        _this.switchTo(i);
    }
};

//method 滑到下一分区
Switchable.prototype.next = function () {
    var _this = this,
        options = _this.options,
        i = options.curTarget;

    if (options.allowTrigger) {
        i++;
        _this.switchTo(i);
    }
};

module.exports = Switchable;

},{}],16:[function(require,module,exports){
'use strict';
/*
 * 模板编译方法
 * 参数说明：
 * text 【String】 需要编译的模板字符串
 * data 【Object】 编译模板时所要传入的数据
 * */
var template = function (text, data) {
    var render,

        settings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g
        },

        noMatch = /(.)^/,

        matcher = new RegExp([
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g'),

        escapes = {
            '\'': '\'',
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        },

        escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g,

        index = 0,

        source = '__p+=\'';


    text.replace(matcher, function (match, interpolate, evaluate, offset) {
        source += text.slice(index, offset)
            .replace(escaper, function (match) { return '\\' + escapes[match]; });

        if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        }

        if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='";
        }

        index = offset + match.length;
        return match;
    });

    source += "';\n";

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
        "print=function(){__p+=__j.call(arguments,'');};\n" +
        source + "return __p;\n";

    try {
        render = new Function(settings.variable || 'obj', source);
    } catch (e) {
        e.source = source;
        throw e;
    }

    if (data) return render(data);
    var tpl = function (data) {
        return render.call(this, data);
    };

    tpl.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return tpl;
};

module.exports = template;

},{}],17:[function(require,module,exports){
'use strict';
var Toast = {
    template: '<div id="J-h-toast" class="ui-toast"></div>',
    timeout: -1,
    show: function (msg, last) {
        var _this = this,
            $toast = $('#J-h-toast'),
            ml, mt;

        if ($toast.length == 0) {
            $toast = $(_this.template);
            $toast.appendTo('body');
        } else {
            _this.hide();
        }

        $toast.html(msg);

        ml = -1 * $toast.outerWidth() / 2;
        mt = -1 * $toast.outerHeight() / 2;

        $toast.css({
            marginLeft: ml,
            marginTop: mt
        }).show();

        _this.timeout = setTimeout(function () {
            _this.hide();
        }, (typeof last == 'undefined' ? 3000 : last));
    },
    hide: function () {
        clearTimeout(this.timeout);
        $('#J-h-toast').hide();
    }
};

module.exports = Toast;

},{}],18:[function(require,module,exports){
'use strict';
var tooltips = {};

/*
 * 提示框生成方法
 * */
tooltips.create = function (opts) {
    var options = {
        //需要添加提示框的目标元素 【JqueryObject】
        target: null,
        //提示框模版【string】
        tpl:　'<div class="J-tooltips ui-tooltips <%= themeCls %>" data-tooltips-create-flag="true">' +
                    '<div class="ui-tooltips-arrow">' +
                        '<i class="J-arrow arrow arrow-out">&#9670;</i>' +
                        '<i class="J-arrow arrow">&#9670;</i>' +
                    '</div>' +
                    '<div class="J-tooltips-content ui-tooltips-content"></div>' +
                '</div>',
        //提示框内容，类型可以是【string】或【function】，如果是【function】，要求该函数必须返回一个字符串
        content: '',
        //提示框主题【string】（默认值：''， 取值范围：''， 'info'， 'success'， 'warning'， 'error'）
        theme: '',
        //提示框展示在目标元素的哪一边【string】（取值范围：'top'， 'bottom'， 'left'， 'right'）
        side: 'top',
        //提示框的宽度【Int】（默认值：0， 默认情况下，宽度是自适应的，但是当 content 的内容是纯文本时，请务必设置 tooltips 宽度，否则可能会出现意想不到的意外结果出现）
        width: 0,
        //用来调整提示框的位置偏移【Object - Int】
        position: {
            top: 0,
            left: 0
        },
        //提示框显示标识
        showFlag: false,
        //提示框展示触发事件【string】（默认值:'mouseenter'）
        eventShow: 'mouseenter',
        //提示框隐藏触发事件【string】（默认值:'mouseleave'，当 eventShow 的值为 'click' 时，eventHide 会被强行无效化。改为点击提示框以外的区域触发隐藏）
        eventHide: 'mouseleave',
        //提示框显示后的回调【function】，有一个参数，传入的是生成的提示框的 JqueryObject
        onShow: null,
        //提示框隐藏后的回调【function】，有一个参数，传入的是生成的提示框的 JqueryObject
        onHide: null
    };

    //依赖template
    var template = require('../Template/Template');

    delete opts.tpl;
    delete opts.showFlag;

    $.extend(options, opts);

    if (options.target && options.target.length > 0) {
        options.target
            .append(template(options.tpl, {
                themeCls: options.theme == '' ? options.theme : 'ui-tooltips-' + options.theme
            }));

        var _width = options.width * 1;
        if (!isNaN(_width) && _width > 0) {
            options.target.find('div.J-tooltips-content').width(_width);
        }

        var targetPosition = options.target.css('position');
        if (targetPosition != 'relative' && targetPosition != 'absolute') {
            options.target.css('position', 'relative');
        }

        options.target.on(options.eventShow, function (e) {
            var $this = $(this),
                $target = $this.find('div.J-tooltips');

            if (!options.showFlag) {
                $target.find('div.J-tooltips-content').html(typeof options.content == 'function' ? options.content() : options.content);
                options.showFlag = true;
            }

            var $this_t = $this.offset().top,
                $this_l = $this.offset().left,
                $this_w = $this.outerWidth(),
                $this_h = $this.outerHeight(),
                $target_w = $target.outerWidth(),
                $target_h = $target.outerHeight(),
                window_w = $(window).width(),
                window_h = $(window).height(),
                scroll_t = $(document).scrollTop(),
                scroll_l = $(document).scrollLeft(),
                cssConfig = {},
                arrowCls = '',
                arrowCssConfig = {};

            if (options.side == 'left' || options.side == 'right') {

                if (options.side == 'left' && $target_w <= $this_l - scroll_l
                    || options.side == 'right' && $target_w > window_w - ($this_l - scroll_l) - $this_w
                ) {
                    arrowCls = 'right';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = ($target_w + 8) * (-1);
                } else {
                    arrowCls = 'left';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = $this_w + 8;
                }

                if (options.contSide && options.contSide == 'bottom' || options.contSide && options.contSide != 'bottom' && $target_h <= window_h - ($this_t - scroll_t)) {
                    arrowCls += '-top';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = 0;
                    arrowCssConfig['top'] = $this_h < $target_h ? $this_h / 2 : $target_h / 2;
                } else if (options.contSide && options.contSide == 'middle') {
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = ($target_h - $this_h) * (-0.5);
                } else {
                    arrowCls += '-bottom';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = ($target_h - $this_h) * (-1);
                    arrowCssConfig['top'] = $target_h - ($this_h < $target_h ? $this_h / 2 : $target_h / 2);
                }

            } else if (options.side == 'top' || options.side == 'bottom') {

                if ( (options.side == 'top' && $this_t - scroll_t < $target_h)
                    || options.side == 'bottom' && $target_h < window_h - ($this_t - scroll_t)
                ) {
                    arrowCls = 'top';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = $this_h + 5;
                } else {
                    arrowCls = 'bottom';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = ($target_h + 5) * (-1);
                }

                if (options.contSide && options.contSide == 'left' || options.contSide && options.contSide != 'right' && $target_w > window_w - ($this_l - scroll_l)) {
                    arrowCls += '-right';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = ($target_w - $this_w) * (-1);
                    arrowCssConfig['left'] = $target_w - ($this_w < $target_w ? $this_w / 2 : $target_w / 2);
                } else if (options.contSide && options.contSide == 'middle') {
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = ($target_w - $this_w) * (-0.5);
                } else {
                    arrowCls += '-left';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = 0;
                    arrowCssConfig['left'] = $this_w < $target_w ? $this_w / 2 : $target_w / 2;
                }

            }

            $target
                .css(cssConfig)
                .addClass('ui-tooltips-' + arrowCls + '-arrow')
                .data('arrowCls', 'ui-tooltips-' + arrowCls + '-arrow')
                .addClass('z-ui-tooltips-in')
                .find('i.J-arrow')
                .css(arrowCssConfig);

            options.onShow && options.onShow($target);
        });

        if (options.eventShow != 'click') {
            options.target.on(options.eventHide, function () {
                var $target = $(this).find('div.J-tooltips');

                $target.addClass('z-ui-tooltips-out');

                setTimeout(function () {
                    $target.removeClass('z-ui-tooltips-in z-ui-tooltips-out' + ' ' + $target.data('arrowCls'));
                    options.showFlag = false;
                    options.onHide && options.onHide($target);
                }, 200);
            });
        } else {
            $(document).on('click', function (e) {
                if ($(e.target).closest(options.target).length == 0) {
                    var $target = options.target.find('div.J-tooltips');

                    $target.addClass('z-ui-tooltips-out');

                    setTimeout(function () {
                        $target.removeClass('z-ui-tooltips-in z-ui-tooltips-out' + ' ' + $target.data('arrowCls'));
                        options.showFlag = false;
                        options.onHide && options.onHide($target);
                    }, 200);
                }
            });
        }

        return options.target.find('div.J-tooltips');
    } else {
        return;
    }
};

/*
 * 提示框显示方法
 * */
tooltips.show = function ($target) {
    var flag = $target.data('tooltipsCreateFlag');
    if (typeof flag == 'undefined' || (flag && flag.toString() != 'true')) {
        $target.addClass('z-ui-tooltips-in');
    } else {
        console.log('通过 create 方法构造出来的 tooltips 不支持 show 方法。请通过触发事件的方式显示它。');
    }
};

/*
 * 提示框隐藏方法
 * */
tooltips.hide = function ($target) {
    $target.addClass('z-ui-tooltips-out');

    setTimeout(function () {
        $target.removeClass('z-ui-tooltips-in z-ui-tooltips-out' + ' ' + $target.data('arrowCls'));
    }, 200);
};

module.exports = tooltips;

},{"../Template/Template":16}],19:[function(require,module,exports){
'use strict';
/*
 * 参数说明：
 * paramsStr 【String】 参数字符串
 * 注意：paramsStr 的格式必须为 "?orderId=44412000008&srcOrderId=123456789001&operationType=edit&orderType=30" 这样的格式。前面的 ? 可有可无，可以只有参数名，没有参数值
 * */
var transformParamsToJSON = function (paramsStr) {
    var paramGroup = [],
        paramPair = [],
        paramsJSON = {};

    if (paramsStr != '') {
        paramsStr = paramsStr.replace('?', '');
        paramGroup = paramsStr.split('&');

        for (var i = 0, len = paramGroup.length; i < len; i++) {
            paramPair = paramGroup[i].split('=');
            paramsJSON[decodeURIComponent(paramPair[0])] = decodeURIComponent(paramPair[1]);
        }
    }

    return paramsJSON;
};

module.exports = transformParamsToJSON;

},{}],20:[function(require,module,exports){
'use strict';
module.exports = function ($) {
    //修复 IE8 以下不支持 indexOf 导致产生错误的 bug
    if (!Array.indexOf) {
        Array.prototype.indexOf = function(obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        };
    }

    var methods = {
        //初始化
        init: function (options) {
            var $form = this;

            if (!$form.data('jqv') || $form.data('jqv') == null) {
                options = methods._saveOptions($form, options);
            }

            $(document).on('click.hideVeErrMsg', '[data-tips-for-field]', function () {
                $(this).fadeOut(300);
            });

            return $form;
        },

        //基本控件的事件绑定
        attach: function (userOptions) {
            var $form = this,
                options;

            if (userOptions) {
                options = methods._saveOptions($form, userOptions);
            } else {
                options = $form.data('jqv');
            }

            //为控件做事件绑定
            if (options.bindFlag) {
                //非 checkbox、radio 以及 非使用了 datepicker 的文本框
                $form.on(options.validationEventTrigger + '.ve', '[' + options.validateAttribute + '*=validate]:not([type=checkbox]):not([type=radio]):not(.datepicker)', methods._onFieldEvent);
                //checkbox、radio
                $form.on('click.ve', '[' + options.validateAttribute + '*=validate][type=checkbox],[' + options.validateAttribute + '*=validate][type=radio]', methods._onFieldEvent);
                //使用了 datepicker 的文本框
                $form.on(options.validationEventTrigger + '.ve', '[' + options.validateAttribute + '*=validate][class*=datepicker]', {delay: 300}, methods._onFieldEvent);
            }

            //为【跳过验证】直接提交按钮绑定事件
            $form.on('click.ve', 'a[data-ve-skip], button[data-ve-skip], input[data-ve-skip]', methods._submitButtonClick);
            $form.removeData('jqv_submitButton');

            //绑定表单提交触发事件回调
            $form.on('submit.ve', methods._onSubmitEvent);
            return this;
        },

        //解除基本控件的事件绑定
        detach: function () {
            var $form = this,
                options = $form.data('jqv');

            $form.find('[' + options.validateAttribute + '*=validate]').not('[type=checkbox]').not('[type=radio]').off(options.validationEventTrigger + '.ve');
            $form.find('[' + options.validateAttribute + '*=validate][type=checkbox],[' + options.validateAttribute + '*=validate][type=radio]').off('click.ve', methods._onFieldEvent);

            $form.off('submit.ve', methods._onSubmitEvent);
            $form.removeData('jqv');

            $form.off('click.ve', 'a[data-ve-skip], button[data-ve-skip], input[data-ve-skip]', methods._submitButtonClick);
            $form.removeData('jqv_submitButton');

            return this;
        },

        //保存设置
        _saveOptions: function ($form, options) {
            if ($.validationEngineLanguage) {
                var allRules = $.validationEngineLanguage.allRules;
            } else {
                $.error('jQuery.validationEngine rules are not loaded, plz add localization files to the page');
            }

            //设置校验规则
            $.validationEngine.defaults.allrules = allRules;

            var userOptions = $.extend(true, {}, $.validationEngine.defaults, options);

            $form.data('jqv', userOptions);

            return userOptions;
        },

        _onFieldEvent: function (event) {
            var $field = $(this),
                $form = $field.closest('form, .J-ve-cont'),
                options = $form.data('jqv');

            options.eventTrigger = 'field';

            window.setTimeout(function() {
                methods._validateField($field, options);

                if (options.InvalidFields.length == 0 && options.onFieldSuccess) {
                    //校验成功时的回调
                    options.onFieldSuccess();
                } else if (options.InvalidFields.length > 0 && options.onFieldFailure) {
                    //校验失败时的回调
                    options.onFieldFailure();
                }
            }, (event.data) ? event.data.delay : 0);
        },

        _submitButtonClick: function (e) {
            var $button = $(this),
                $form = $button.closest('form, .J-ve-cont');

            $form.data('jqv_submitButton', $button.attr('id'));
        },

        _onSubmitEvent: function (e) {
            var $form = $(this),
                options = $form.data('jqv');

            //check if it is trigger from skipped button
            if ($form.data('jqv_submitButton')) {
                var $submitButton = $('#' + $form.data('jqv_submitButton'));
                if ($submitButton.length > 0) {
                    if ($submitButton.hasClass('validate-skip') || $submitButton.attr('data-validation-engine-skip') == 'true') {
                        return true;
                    }
                }
            }

            options.eventTrigger = 'submit';

            //校验表单中所有控件的值
            var r = methods._validateFields($form);

            if (options.onValidationComplete) {
                //如果用户自定义了表单验证完成回调，则执行之
                return !!options.onValidationComplete($form, r);
            }

            return r;
        },

        /*
        * 表单验证方法
        * 验证通过是返回 true，否则返回 false
        * */
        validate: function () {
            var $this = this,
                valid = null; //校验结果

            if ($this.is('form') || $this.hasClass('J-ve-cont')) {
                //校验整个表单
                if ($this.hasClass('validating')) {
                    //表单校验中...（防止多次快速连续校验）
                    return false;
                } else {
                    $this.addClass('validating');

                    var options = $this.data('jqv'),
                        valid = methods._validateFields($this);

                    //0.1秒后移除校验中状态class
                    setTimeout(function(){
                        $this.removeClass('validating');
                    }, 100);

                    if (valid && options.onSuccess) {
                        options.onSuccess();
                    } else if (!valid && options.onFailure) {
                        options.onFailure();
                    }
                }
            } else {
                //校验某个控件
                var $form = $this.closest('form, .J-ve-cont'),
                    options = ($form.data('jqv')) ? $form.data('jqv') : $.validationEngine.defaults,
                    valid = methods._validateField($this, options);

                if (valid && options.onFieldSuccess) {
                    options.onFieldSuccess();
                } else if (options.onFieldFailure && options.InvalidFields.length > 0) {
                    options.onFieldFailure();
                }
            }

            if (options.onValidationComplete) {
                //如果用户自定义了表单验证完成回调，则执行之
                return !!options.onValidationComplete($form, valid);
            }

            return valid;
        },

        /*
         * 值验证方法（仅供内部调用）
         * 验证通过是返回 true，否则返回 false
         * */
        _validateFields: function ($form) {
            var options = $form.data('jqv'),
                first_err = null; //用来缓存第一个出现报错的控件

            //触发 开始进行表单校验 钩子
            $form.trigger('jqv.form.validating');

            //对表单中包含校验标记的所有控件的值进行校验
            $form.find('[' + options.validateAttribute + '*=validate]').not(':disabled').each(function () {
                var $field = $(this),
                    names = []; //缓存已经验证过的控件类型

                //如果这一类（name属性相同的控件为同一类）控件还没进行验证
                if ($.inArray(this.name, names) < 0) {
                    //定义错误标记，当校验出现错误，它会被设为true
                    var errorFound = !methods._validateField($field, options);

                    if (errorFound && first_err == null) {
                        //如果出现校验报错
                        if ($field.is(':hidden') && options.prettySelect && $field.is('select')) {
                            //如果是隐藏控件（用户自定义生成的下拉框，原控件会被隐藏掉）
                            $field = $form.find('#' + $field.data('prettySelect'));
                        }
                        first_err = $field;

                    }

                    if (options.doNotShowAllErrorsOnSubmit) {
                        //如果设置了表单提交时不展示任何错误信息，直接返回校验结果 false
                        return false;
                    }

                    //将当前类型添加到 names 列表
                    names.push($field.attr('name'));

                    if (options.showOneMessage == true && errorFound) {
                        //如果设置了只展示一条错误信息，且发现控件验证不通过
                        return false;
                    }
                }
            });

            //触发 表单校验完成 钩子
            $form.trigger('jqv.form.result', [(first_err == null)]);

            if (first_err != null) {

                if (options.scroll) {
                    var destination = first_err.offset().top,
                        fixLeft = first_err.offset().left;

                    $('html, body').animate({
                        scrollTop: destination,
                        scrollLeft: fixLeft
                    }, 500, function(){
                        if(options.focusFirstField) {
                            first_err.focus();
                        }
                    });

                } else if (options.focusFirstField) {
                    first_err.focus();
                }

                return false;
            }

            return true;
        },

        /*
         * 值验证方法（仅供内部调用）
         * 验证通过是返回 false，否则返回 true
         * */
        _validateField: function ($field, options) {
            if ($field.is(':hidden') && !options.prettySelect && $field.is('select') || $field.parent().is(':hidden') || $field.prop('disabled')) {
                return true;
            }

            var veRules = $field.attr(options.validateAttribute),
                veRulesList = /validate\[(.*)\]/.exec(veRules);

            if (!veRulesList) {
                return true;
            }

            var str = veRulesList[1],
                rules = str.split(/\[|,|\]/),
                fieldName = $field.attr('name'),
                promptText = '',
                required = false,
                limitErrors = false,
                $form = $field.closest('form, .J-ve-cont');

            options.isError = false;

            if (options.maxErrorsPerField > 0) {
                //如果设置了最大错误信息提示数量
                limitErrors = true;
            }

            for (var i = 0, rulesLen = rules.length; i < rulesLen; i++) {
                //移除空格符
                rules[i] = rules[i].replace(' ', '');
                if (rules[i] === '') {
                    //移除内容为空的元素
                    delete rules[i];
                }
            }

            for (var i = 0, field_errors = 0; i < rules.length; i++) {

                if (limitErrors && field_errors >= options.maxErrorsPerField) {
                    //如果设置了最大错误信息提示数，且校验出错数 >= 该最大提示数
                    if (!required) {
                        var have_required = $.inArray('required', rules);
                        required = (have_required != -1 && have_required >= i);
                    }
                    break;
                }

                var errorMsg = undefined;

                switch (rules[i]) {
                    case 'required':
                        required = true;
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._required);
                        break;

                    case 'custom':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._custom);
                        break;

                    case 'groupRequired':
                        //这里做过比较大的修改，需要校验是否会出现问题
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._groupRequired);

                        if (errorMsg) {
                            required = true;
                        }

                        break;

                    case 'minSize':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._minSize);
                        break;

                    case 'maxSize':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._maxSize);
                        break;

                    case 'min':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._min);
                        break;

                    case 'max':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._max);
                        break;

                    case 'past':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._past);
                        break;

                    case 'future':
                        errorMsg = methods._getErrorMessage($form, $field ,rules[i], rules, i, options, methods._future);
                        break;

                    case 'dateRange':
                        var classGroup = '[' + options.validateAttribute + '*=' + rules[i + 1] + ']';
                        options.firstOfGroup = $form.find(classGroup).eq(0);
                        options.secondOfGroup = $form.find(classGroup).eq(1);

                        if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
                            //如果两个控件其中一个有值，就执行校验
                            errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._dateRange);
                        }

                        if (errorMsg) {
                            required = true;
                        }

                        break;

                    case 'dateTimeRange':
                        var classGroup = '[' + options.validateAttribute + '*=' + rules[i + 1] + ']';
                        options.firstOfGroup = $form.find(classGroup).eq(0);
                        options.secondOfGroup = $form.find(classGroup).eq(1);

                        if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
                            //如果两个控件其中一个有值，就执行校验
                            errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._dateTimeRange);
                        }

                        if (errorMsg) {
                            required = true;
                        }

                        break;

                    case 'maxCheckbox':
                        $field = $form.find('input[name="' + fieldName + '"]');
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._maxCheckbox);
                        break;

                    case 'minCheckbox':
                        $field = $form.find('input[name="' + fieldName + '"]');
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._minCheckbox);
                        break;

                    case 'equals':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._equals);
                        break;

                    case 'funcCall':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._funcCall);
                        break;

                    case 'creditCard':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._creditCard);
                        break;

                    case 'condRequired':
                        errorMsg = methods._getErrorMessage($form, $field, rules[i], rules, i, options, methods._condRequired);
                        if (errorMsg !== undefined) {
                            required = true;
                        }
                        break;

                    default:
                }

                var end_validation = false; //结束验证标记

                if (typeof errorMsg == 'object') {
                    //如果校验返回一个消息对象，根据它的 status 来决定下一步怎么做
                    switch (errorMsg.status) {
                        case '_break':
                            //改变结束验证标记
                            end_validation = true;
                            break;

                        case '_error':
                            errorMsg = errorMsg.message;
                            break;

                        default:
                            break;
                    }
                }

                if (end_validation) {
                    //结束验证
                    break;
                }

                if (typeof errorMsg == 'string') {
                    //如果返回了一个消息字符串，将其拼接组装其他，以备展示
                    promptText += errorMsg + '<br/>';
                    options.isError = true;
                    field_errors++;
                }
            }

            if (!required && !($field.val()) && $field.val().length < 1 && rules.indexOf('equals') < 0) {
                //假如非必填，值为空，又不需要与其他控件的值相等...
                options.isError = false;
            }

            //关于单选和复选框的错误信息展示相关处理
            var fieldType = $field.prop('type');

            if ((fieldType == 'radio' || fieldType == 'checkbox') && $form.find('input[name="' + fieldName + '"]').size() > 1) {
                $field = $($form.find('input[name="' + fieldName + '"][type!=hidden]:first'));
            }

            if ($field.is(':hidden') && options.prettySelect && $field.is('select')) {
                //如果是隐藏控件（用户自定义生成的下拉框，原控件会被隐藏掉）
                $field = $form.find('#' + $field.data('prettySelect'));
            }

            if (options.isError && options.showErrorFlag) {
                methods._showErrorMsg($field, promptText, $form, options);
            } else {
                methods._hideErrorMsg($field, $form, options);
            }

            //为控件添加状态 css class（如果有设置的话）
            methods._handleStatusCssClasses($field, options);

            //记录报错
            var errIndex = $.inArray($field[0], options.InvalidFields);
            if (errIndex == -1 && options.isError) {
                //如果校验有误，且当前控件不在错误控件列表中时，将当前控件假如到错误控件列表中去
                options.InvalidFields.push($field[0]);
            } else if (!options.isError) {
                //如果验证无误，将当前控件从错误控件列表中移除
                options.InvalidFields.splice(errIndex, 1);
            }

            //执行校验出错回调
            if (options.isError && options.onFieldFailure) {
                options.onFieldFailure($field);
            }

            //执行校验通过回调
            if (!options.isError && options.onFieldSuccess) {
                options.onFieldSuccess($field);
            }

            return !options.isError;
        },

        _jqSelector: function (str) {
            return str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
        },

        _handleStatusCssClasses: function($field, options) {
            //移除class
            if (options.addSuccessCssClassToField) {
                $field.removeClass(options.addSuccessCssClassToField);
            }

            if (options.addFailureCssClassToField) {
                $field.removeClass(options.addFailureCssClassToField);
            }

            //添加class
            if (options.addSuccessCssClassToField && !options.isError) {
                $field.addClass(options.addSuccessCssClassToField);
            }

            if (options.addFailureCssClassToField && options.isError) {
                $field.addClass(options.addFailureCssClassToField);
            }
        },

        _getErrorMessage: function ($form, $field, rule, rules, i, options, originalValidationMethod) {
            var rule_index = $.inArray(rule, rules),
                errorMsg = undefined;

            if (rule === 'custom' || rule === 'funcCall') {
                //如果是 custom 或 funcCall 校验方式，合并
                var custom_validation_type = rules[rule_index + 1];
                rule = rule + '[' + custom_validation_type + ']';
                delete(rules[rule_index]);
            }

            if (rule == 'future' || rule == 'past' || rule == 'maxCheckbox' || rule == 'minCheckbox') {
                //如果是这4种校验规则，这样调用校验方法
                errorMsg = originalValidationMethod($form, $field, rules, i, options);
            } else {
                //其他情况
                errorMsg = originalValidationMethod($field, rules, i, options);
            }

            if (errorMsg != undefined) {
                //如果返回了校验错误信息，再尝试获取用户自定义校验信息（如果用户有自定义校验信息，就拿用户自定义的校验信息覆盖原来的）
                var custom_message = methods._getCustomErrorMessage($field, rule, options);
                if (custom_message) {
                    errorMsg = custom_message;
                }
            }

            return errorMsg;
        },

        _getCustomErrorMessage: function ($field, rule, options) {
            var custom_message = '',
                validityProp = '';

            if (/^custom\[.*\]$/.test(rule)) {
                validityProp = 'custom';
            } else if (/^funcCall\[.*\]$/.test(rule)) {
                validityProp = 'funcCall';
            } else {
                validityProp = rule;
            }

            if (validityProp) {
                custom_message = $field.attr('data-ve-msg-' + validityProp);
                if (custom_message) {
                    //如果有错误信息，返回之
                    return custom_message;
                }
            }

            custom_message = $field.attr('data-ve-msg');
            if (custom_message) {
                //如果有错误信息，返回之
                return custom_message;
            }

            return custom_message;
        },

        _required: function ($field, rules, i, options, condRequired) {
            switch ($field.prop('type')) {
                /*case 'text':
                case 'password':
                case 'textarea':
                case 'file':
                case 'select-one':
                case 'select-multiple':*/
                case 'radio':
                    if (condRequired) {
                        if (!$field.prop('checked')) {
                            return options.allrules[rules[i]].alertTextCheckboxMultiple;
                        }
                        break;
                    }

                    var $form = $field.closest('form, .J-ve-cont'),
                        name = $field.attr('name');

                    if ($form.find('input[name="' + name + '"]:checked').size() == 0) {

                        if ($form.find('input[name="' + name + '"]:visible').size() == 1) {
                            return options.allrules[rules[i]].alertTextCheckbox;
                        } else {
                            return options.allrules[rules[i]].alertTextCheckboxMultiple;
                        }

                    }
                    break;
                case 'checkbox':
                    if (condRequired) {
                        if (!$field.prop('checked')) {
                            return options.allrules[rules[i]].alertTextCheckboxMultiple;
                        }
                        break;
                    }

                    var $form = $field.closest('form, .J-ve-cont'),
                        name = $field.attr('name');

                    if ($form.find('input[name="' + name + '"]:checked').size() == 0) {

                        if ($form.find('input[name="' + name + '"]:visible').size() == 1) {
                            return options.allrules[rules[i]].alertTextCheckbox;
                        } else {
                            return options.allrules[rules[i]].alertTextCheckboxMultiple;
                        }

                    }
                    break;
                default:
                    var field_val = $.trim($field.val()),
                        dv_placeholder = $.trim($field.attr('data-validation-placeholder')),
                        placeholder = $.trim($field.attr('placeholder'));

                    if (!field_val
                        || (dv_placeholder && field_val == dv_placeholder)
                        || (placeholder && field_val == placeholder)
                    ) {
                        return options.allrules[rules[i]].alertText;
                    }
                    break;
            }
        },

        _groupRequired: function ($field, rules, i, options) {
            var classGroup = '[' + options.validateAttribute + '*=' + rules[i + 1] + ']',
                isValid = false;

            $field.closest('form, .J-ve-cont').find(classGroup).each(function(){
                if (!methods._required($(this), rules, i, options)) {
                    isValid = true;
                    return false;
                }
            });

            if(!isValid) {
                return options.allrules[rules[i]].alertText;
            }
        },

        _custom: function ($field, rules, i, options) {
            var customRule = rules[i + 1],
                rule = options.allrules[customRule],
                fn;

            if (!rule) {
                alert('jqv:custom rule not found - ' + customRule);
                return;
            }

            if (rule['regex']) {

                var ex = rule.regex;

                if(!ex) {
                    alert('jqv:custom regex not found - '+customRule);
                    return;
                }

                var pattern = new RegExp(ex);

                if (!pattern.test($field.val())) {
                    return options.allrules[customRule].alertText;
                }

            } else if(rule['func']) {

                fn = rule['func'];

                if (typeof(fn) !== 'function') {
                    alert('jqv:custom parameter "function" is no function - ' + customRule);
                    return;
                }

                if (!fn($field, rules, i, options)) {
                    return options.allrules[customRule].alertText;
                }

            } else {
                alert('jqv:custom type not allowed ' + customRule);
                return;
            }
        },

        _funcCall: function ($field, rules, i, options) {
            var functionName = rules[i + 1],
                fn;

            if (functionName.indexOf('.') > -1) {
                var namespaces = functionName.split('.'),
                    scope = window;

                while (namespaces.length) {
                    scope = scope[namespaces.shift()];
                }

                fn = scope;
            } else {
                fn = window[functionName] || options.customFunctions[functionName];
            }

            if (typeof(fn) == 'function') {
                return fn($field, rules, i, options);
            }
        },

        _equals: function ($field, rules, i, options) {
            var equalsField = rules[i + 1];

            if ($field.val() != $('#' + equalsField).val()) {
                return options.allrules.equals.alertText;
            }
        },

        _maxSize: function ($field, rules, i, options) {
            var max = rules[i + 1],
                len = $field.val().length;

            if (len > max) {
                var rule = options.allrules.maxSize;
                return rule.alertText + max + rule.alertText2;
            }
        },

        _minSize: function ($field, rules, i, options) {
            var min = rules[i + 1],
                len = $field.val().length;

            if (len < min) {
                var rule = options.allrules.minSize;
                return rule.alertText + min + rule.alertText2;
            }
        },

        _min: function ($field, rules, i, options) {
            var min = parseFloat(rules[i + 1]),
                len = parseFloat($field.val());

            if (len < min) {
                var rule = options.allrules.min;
                if (rule.alertText2) {
                    return rule.alertText + min + rule.alertText2;
                }
                return rule.alertText + min;
            }
        },

        _max: function ($field, rules, i, options) {
            var max = parseFloat(rules[i + 1]),
                len = parseFloat($field.val());

            if (len > max) {
                var rule = options.allrules.max;
                if (rule.alertText2) {
                    return rule.alertText + max + rule.alertText2;
                }
                return rule.alertText + max;
            }
        },

        _past: function ($form, $field, rules, i, options) {
            var p = rules[i + 1],
                fieldAlt = $($form.find('*[name="' + p.replace(/^#+/, '') + '"]')),
                pDate;

            if (p.toLowerCase() == 'now') {
                pDate = new Date();
            } else if (undefined != fieldAlt.val()) {
                if (fieldAlt.is(':disabled')) {
                    return;
                }
                pDate = methods._parseDate(fieldAlt.val());
            } else {
                pDate = methods._parseDate(p);
            }

            var vDate = methods._parseDate($field.val());

            if (vDate > pDate ) {
                var rule = options.allrules.past;
                if (rule.alertText2) {
                    return rule.alertText + methods._dateToString(pDate) + rule.alertText2;
                }
                return rule.alertText + methods._dateToString(pDate);
            }
        },

        _future: function($form, $field, rules, i, options) {
            var p = rules[i + 1],
                fieldAlt = $($form.find('*[name="' + p.replace(/^#+/, '') + '"]')),
                pDate;

            if (p.toLowerCase() == 'now') {
                pDate = new Date();
            } else if (undefined != fieldAlt.val()) {
                if (fieldAlt.is(':disabled')) {
                    return;
                }
                pDate = methods._parseDate(fieldAlt.val());
            } else {
                pDate = methods._parseDate(p);
            }

            var vDate = methods._parseDate($field.val());

            if (vDate < pDate ) {
                var rule = options.allrules.future;
                if (rule.alertText2) {
                    return rule.alertText + methods._dateToString(pDate) + rule.alertText2;
                }
                return rule.alertText + methods._dateToString(pDate);
            }
        },

        _isDate: function (value) {
            var dateRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/);
            return dateRegEx.test(value);
        },

        _isDateTime: function (value) {
            var dateTimeRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/);
            return dateTimeRegEx.test(value);
        },

        _dateCompare: function (start, end) {
            return (new Date(start.toString()) < new Date(end.toString()));
        },

        _dateRange: function ($field, rules, i, options) {
            //are not both populated
            if ( (!options.firstOfGroup[0].value && options.secondOfGroup[0].value)
                || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)
            ) {
                return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
            }

            //are not both dates
            if ( !methods._isDate(options.firstOfGroup[0].value)
                || !methods._isDate(options.secondOfGroup[0].value)
            ) {
                return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
            }

            //are both dates but range is off
            if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
                return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
            }
        },

        _dateTimeRange: function ($field, rules, i, options) {
            //are not both populated
            if ( (!options.firstOfGroup[0].value && options.secondOfGroup[0].value)
                || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)
            ) {
                return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
            }

            //are not both dates
            if ( !methods._isDateTime(options.firstOfGroup[0].value)
                || !methods._isDateTime(options.secondOfGroup[0].value)
            ) {
                return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
            }

            //are both dates but range is off
            if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
                return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
            }
        },

        _maxCheckbox: function ($form, $field, rules, i, options) {
            var nbCheck = rules[i + 1],
                groupName = $field.attr('name'),
                groupSize = $form.find('input[name="' + groupName + '"]:checked').size();

            if (groupSize > nbCheck) {
                if (options.allrules.maxCheckbox.alertText2) {
                    return options.allrules.maxCheckbox.alertText + ' ' + nbCheck + ' ' + options.allrules.maxCheckbox.alertText2;
                }
                return options.allrules.maxCheckbox.alertText;
            }
        },

        _minCheckbox: function ($form, $field, rules, i, options) {
            var nbCheck = rules[i + 1],
                groupName = $field.attr('name'),
                groupSize = $form.find('input[name="' + groupName + '"]:checked').size();

            if (groupSize < nbCheck) {
                return options.allrules.minCheckbox.alertText + ' ' + nbCheck + ' ' + options.allrules.minCheckbox.alertText2;
            }
        },

        _creditCard: function ($field, rules, i, options) {
            //spaces and dashes may be valid characters, but must be stripped to calculate the checksum.
            var valid = false,
                cardNumber = $field.val().replace(/ +/g, '').replace(/-+/g, ''),
                numDigits = cardNumber.length;

            if (numDigits >= 14 && numDigits <= 16 && parseInt(cardNumber) > 0) {

                var sum = 0,
                    i = numDigits - 1,
                    pos = 1,
                    digit,
                    str = new String();

                do {
                    digit = parseInt(cardNumber.charAt(i));
                    str += (pos++ % 2 == 0) ? digit * 2 : digit;
                } while (--i >= 0)

                for (i = 0; i < str.length; i++) {
                    sum += parseInt(str.charAt(i));
                }

                valid = sum % 10 == 0;
            }

            if (!valid) {
                return options.allrules.creditCard.alertText;
            }
        },

        _dateToString: function (date) {
            return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        },

        _parseDate: function (d) {
            var dateParts = d.split("-");

            if (dateParts == d) {
                dateParts = d.split("/");
            }

            if (dateParts == d) {
                dateParts = d.split(".");
                return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
            }

            return new Date(dateParts[0], (dateParts[1] - 1) ,dateParts[2]);
        },

        _condRequired: function ($field, rules, i, options) {
            var idx,
                dependingField;

            for (idx = (i + 1); idx < rules.length; idx++) {
                dependingField = $('#' + rules[idx]).first();

                if (dependingField.length && methods._required(dependingField, ['required'], 0, options, true) == undefined) {
                    return methods._required($field, ['required'], 0, options);
                }
            }
        },

        showErrorMsg: function (promptText) {
            var $this = this,
                $form = $this.closest('form, .J-ve-cont'),
                options = $form.data('jqv');

            methods._showErrorMsg($this, promptText, $form, options);
            return this;
        },

        _showErrorMsg: function ($field, promptText, $form, options) {
            if (options && options.showErrorMsg) {
                options.showErrorMsg($field, promptText, $form, options);
            } else {
                $form.find('[data-tips-for-field=' + $field.attr('name') + ']')
                    .find('.J-ve-err-msg-txt')
                    .html(promptText)
                    .end()
                    .fadeIn(300);
            }
        },

        hideErrorMsg: function () {
            var $this = this,
                $form = $this.closest('form, .J-ve-cont'),
                options = $form.data('jqv');

            methods._hideErrorMsg($this, options);
            return this;
        },

        _hideErrorMsg: function ($field, $form, options) {
            if (options && options.hideErrorMsg) {
                options.hideErrorMsg($field, $form, options);
            } else {
                $form.find('[data-tips-for-field=' + $field.attr('name') + ']')
                    .fadeOut(300);
            }
        },

        hideAll: function () {
            var $form = this,
                options = $form.data('jqv');

            if (options && options.hideAll) {
                options.hideAll($form, options);
            } else {
                $form.find('[data-tips-for-field]').fadeOut(300);
            }
        }
    };

    $.fn.validationEngine = function (method) {
        var $this = $(this);

        if (!$this[0]) return $this;  //表单不存在，不再往下执行

        if (typeof(method) == 'string' && method.charAt(0) != '_' && methods[method]) {

            //确保 init 方法先被调用一次
            if (method != 'showErrorMsg' && method != 'hideErrorMsg' && method != 'hideAll') {
                methods.init.apply($this);
            }
            return methods[method].apply($this, Array.prototype.slice.call(arguments, 1));

        } else if (typeof method == 'object' || !method) {

            //初始化
            methods.init.apply($this, arguments);
            return methods.attach.apply($this);

        } else {
            $.error('Method ' + method + ' does not exist in jQuery.validationEngine');
        }
    };

    //暴露全局配置
    $.validationEngine = {
        defaults: {
            //用于获取校验规则的属性
            validateAttribute: 'data-ve',

            //是否显示错误提示
            showErrorFlag: true,
            //自定义错误提示显示方法  参数：$field, promptText, $form, options
            showErrorMsg:　false,
            //自定义错误提示隐藏方法  参数：$field, $form, options
            hideErrorMsg: false,
            //自定义的所有错误提示隐藏方法  参数：$form, options
            hideAll: false,


            //是否整个表单只显示一条错误提示信息
            showOneMessage: false,
            //每个控件最多显示的错误信息条数（默认为 false，可以设置具体数值）
            maxErrorsPerField: 1,
            //含有无效值的控件列表
            InvalidFields: [],

            //只要有任何一个校验不通过，那么 isError 就会被设为 true
            isError: false,
            //是否控件事件绑定
            bindFlag: true,
            //控件校验触发事件类型
            validationEventTrigger: 'blur',

            //是否滚动到第一个报错控件处
            scroll: true,
            //是否自动获得第一个报错控件的焦点
            focusFirstField: true,
            //【表单提交时的表单验证】是否不显示任何验证报错信息
            doNotShowAllErrorsOnSubmit: false,

            //可以设置表单验证完成的回调，需要返回 true 或 false
            onValidationComplete: false,
            //表单验证通过时的回调
            onSuccess: false,
            //表单验证失败时的回调
            onFailure: false,
            //控件验证通过时的回调
            onFieldSuccess: false,
            //控件验证失败时的回调
            onFieldFailure: false,
            //控件校验失败时要添加的 css class
            addSuccessCssClassToField: '',
            //控件校验成功时要添加的 css class
            addFailureCssClassToField: '',

            //是否使用了美化控件（自定义生成的下拉框）
            prettySelect: false

        }
    };

    /*
    * .J-ve-cont —— 可以用带这个 class 的其他元素来代替 form 元素，指定表单范围
    * data-ve —— 用于定义校验规则
    * data-ve-skip —— 假如在表单提交按钮上添加次属性，并将它的值设为true，点击按钮将跨过表单校验流程直接提交表单
    * data-ve-msg-[validateType] —— 自定义指定校验类型的错误提示信息（高优先级） 例：<input type="text" data-ve-msg-required="此项为必填项" />
    * data-ve-msg —— 自定义校验类型的错误提示信息（任何校验类型通用，中等优先级） 例：<input type="text" data-ve-msg="您输入的内容无法通过校验，请重新输入" />
    * data-pretty-select —— 指定用户生成的模拟下拉框的ID，这个属性要添加到相对应的原生下拉框之中
    * data-tips-for-field —— 默认的错误信息提示框 target selector,它的 value 可以指定它显示哪个控件的错误提示信息
    * .J-ve-err-msg-txt —— 默认的错误信息提示框的提示信息插入元素 target selector，可以是信息提示框本体或者其后代节点
    * */
};

},{}],21:[function(require,module,exports){
'use strict';
module.exports = function ($) {
    // 验证规则
    $.validationEngineLanguage = {
        newLang: function () {
            this.allRules = {
                required: {
                    regex: 'none',
                    alertText: '* 此处不可空白',
                    alertTextCheckboxMultiple: '* 请选择一个项目',
                    alertTextCheckbox: '* 该选项为必选',
                    alertTextDateRange: '* 日期范围不可空白'
                },
                dateRange: {
                    regex: 'none',
                    alertText: '* 无效的 ',
                    alertText2: ' 日期范围'
                },
                dateTimeRange: {
                    regex: 'none',
                    alertText: '* 无效的 ',
                    alertText2: ' 时间范围'
                },
                minSize: {
                    regex: 'none',
                    alertText: '* 最少 ',
                    alertText2: ' 个字符'
                },
                maxSize: {
                    regex: 'none',
                    alertText: '* 最多 ',
                    alertText2: ' 个字符'
                },
                groupRequired: {
                    regex: 'none',
                    alertText: '* 至少填写其中一项'
                },
                min: {
                    regex: 'none',
                    alertText: '* 最小值为 '
                },
                max: {
                    regex: 'none',
                    alertText: '* 最大值为 '
                },
                past: {
                    regex: 'none',
                    alertText: '* 日期需在 ',
                    alertText2: ' 之前'
                },
                future: {
                    regex: 'none',
                    alertText: '* 日期需在 ',
                    alertText2: ' 之后'
                },
                maxCheckbox: {
                    regex: 'none',
                    alertText: '* 最多选择 ',
                    alertText2: ' 个项目'
                },
                minCheckbox: {
                    regex: 'none',
                    alertText: '* 最少选择 ',
                    alertText2: ' 个项目'
                },
                equals: {
                    regex: 'none',
                    alertText: '* 两次输入的密码不一致'
                },
                creditCard:  {
                    regex:  'none',
                    alertText:  '* 无效的信用卡号码'
                },
                phone: {
                    regex: /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
                    alertText: '* 无效的电话号码'
                },
                mobile:{
                    regex: /^[1][3-8]+\d{9}/,
                    alertText: '* 无效的手机号'
                },
                email: {
                    regex: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
                    alertText: '* 无效的邮件地址'
                },
                integer: {
                    regex: /^[\-\+]?\d+$/,
                    alertText: '* 无效的整数'
                },
                number: {
                    regex:  /^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/,
                    alertText: '* 无效的数值'
                },
                date: {
                    regex: /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/,
                    alertText: '* 无效的日期，格式必需为 YYYY-MM-DD'
                },
                ipv4: {
                    regex: /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/,
                    alertText: '* 无效的 IP 地址'
                },
                url: {
                    regex:/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                    alertText:'* 无效的网址'
                },
                onlyNumberSp: {
                    regex: /^[0-9\ ]+$/,
                    alertText: '* 只能填写数字'
                },
                nonZeroNumber: {
                    regex: /^(([1-9]+[0-9]*.{1}[0-9]+)|([0].{1}[1-9]+[0-9]*)|([1-9][0-9]*)|([0][.][0-9]+[1-9]*))$/,
                    alertText: '* 只能填写非0数字'
                },
                onlyLetterSp: {
                    regex: /^[a-zA-Z\ \']+$/,
                    alertText: '* 只能填写英文字母'
                },
                onlyLetterNumber: {
                    regex: /^[0-9a-zA-Z]+$/,
                    alertText: '* 只能填写数字与英文字母'
                },
                dateFormat: {
                    regex: /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/,
                    alertText: '* 无效的日期格式'
                },
                dateTimeFormat: {
                    regex: /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/,
                    alertText: '* 无效的日期或时间格式',
                    alertText2: '可接受的格式：',
                    alertText3: 'mm/dd/yyyy hh:mm:ss AM|PM 或 ',
                    alertText4: 'yyyy-mm-dd hh:mm:ss AM|PM'
                },
                chinese: {
                    regex: /^[\u4E00-\u9FA5]+$/,
                    alertText: '* 只能填写中文汉字'
                },
                noChinese: {
                    regex: /^[^\u4e00-\u9fa5]{0,}$/,
                    alertText: '* 此处不可填写中文汉字'
                },
                chinaId: {
                    /**
                     * 2013年1月1日起第一代身份证已停用，此处仅验证 18 位的身份证号码
                     * 如需兼容 15 位的身份证号码，请使用宽松的 chinaIdLoose 规则
                     * /^[1-9]\d{5}[1-9]\d{3}(
                     * 	(
                     * 		(0[13578]|1[02])
                     * 		(0[1-9]|[12]\d|3[01])
                     * 	)|(
                     * 		(0[469]|11)
                     * 		(0[1-9]|[12]\d|30)
                     * 	)|(
                     * 		02
                     * 		(0[1-9]|[12]\d)
                     * 	)
                     * )(\d{4}|\d{3}[xX])$/i
                     */
                    regex: /^[1-9]\d{5}[1-9]\d{3}(((0[13578]|1[02])(0[1-9]|[12]\d|3[0-1]))|((0[469]|11)(0[1-9]|[12]\d|30))|(02(0[1-9]|[12]\d)))(\d{4}|\d{3}[xX])$/,
                    alertText: '* 无效的身份证号码'
                },
                chinaIdLoose: {
                    regex: /^(\d{18}|\d{15}|\d{17}[xX])$/,
                    alertText: '* 无效的身份证号码'
                },
                chinaZip: {
                    regex: /^\d{6}$/,
                    alertText: '* 无效的邮政编码'
                },
                qq: {
                    regex: /^[1-9]\d{4,10}$/,
                    alertText: '* 无效的 QQ 号码'
                }
            };

        }
    };

    $.validationEngineLanguage.newLang();
};

},{}],22:[function(require,module,exports){
'use strict';
(function(window, $){
    //实例
    var Monitor = require('./Util_modules/Monitor/Monitor');
    var Storage = require('./Util_modules/Storage/Storage');
    var Cookie = require('./Util_modules/Cookie/Cookie');
    var ItvEvents = require('./Util_modules/ItvEvents/ItvEvents');
    var Loader = require('./Util_modules/Loader/Loader');
    var Tooltips = require('./Util_modules/Tooltips/Tooltips');
    var Loading = require('./Util_modules/Loading/Loading');
    var Toast = require('./Util_modules/Toast/Toast');

    //类
    var Switchable = require('./Util_modules/Switchable/Switchable');
    var Pager = require('./Util_modules/Pager/Pager');
    var LazyDom = require('./Util_modules/LazyDom/LazyDom');

    //方法
    var Template = require('./Util_modules/Template/Template');
    var GetStrCodeLength = require('./Util_modules/GetStrCodeLength/GetStrCodeLength');
    var SubStrByCode = require('./Util_modules/SubStrByCode/SubStrByCode');
    var TransformParamsToJSON = require('./Util_modules/TransformParamsToJSON/TransformParamsToJSON');
    var ParsePrice = require('./Util_modules/ParsePrice/ParsePrice');

    //原生对象方法扩展
    var DateFormat = require('./Util_modules/DateFormat/DateFormat');

    //Jquery方法扩展
    var ValidationEngine = require('./Util_modules/ValidationEngine/ValidationEngine');
    var ValidationEngineLanguage = require('./Util_modules/ValidationEngine/ValidationEngineLanguageCN');

    window.H = window.H || {};

    //代理console.log
    H.log = function (msg) {
        if (typeof window['console'] != 'undefined') {
            try {
                window.console.log.call(window.console, '%c' + msg, 'font-size:14px; color:#C0A; font-family:微软雅黑; text-shadow:0px 1px 2px #ff0;');
            } catch (e) {
                window.console.log(msg);
            }
        }
    };

    //实例
    H.Monitor = new Monitor();
    H.Storage = new Storage();
    H.ItvEvents = new ItvEvents();
    H.Loader = new Loader();
    H.Tooltips = Tooltips;
    H.Cookie = Cookie;
    H.Loading = Loading;
    H.Toast = Toast;

    //类
    H.Switchable = Switchable;
    H.Pager = Pager;
    H.LazyDom = LazyDom;

    //方法
    H.template = Template;
    H.getStrCodeLength = GetStrCodeLength;
    H.subStrByCode = SubStrByCode;
    H.transformParamsToJSON = TransformParamsToJSON;
    H.parsePrice = ParsePrice;

    //原生对象方法扩展
    DateFormat();

    //Jquery方法扩展
    ValidationEngine($);
    ValidationEngineLanguage($);

    //H.log('欢迎使用 H 工具库，相关 API 可到 【https://github.com/YD-Feng/H.Util】 查看 readME 或 查看 demo');

})(window, jQuery);

},{"./Util_modules/Cookie/Cookie":1,"./Util_modules/DateFormat/DateFormat":2,"./Util_modules/GetStrCodeLength/GetStrCodeLength":3,"./Util_modules/ItvEvents/ItvEvents":4,"./Util_modules/LazyDom/LazyDom":5,"./Util_modules/Loader/Loader":6,"./Util_modules/Loading/Loading":7,"./Util_modules/Monitor/Monitor":10,"./Util_modules/Pager/Pager":11,"./Util_modules/ParsePrice/ParsePrice":12,"./Util_modules/Storage/Storage":13,"./Util_modules/SubStrByCode/SubStrByCode":14,"./Util_modules/Switchable/Switchable":15,"./Util_modules/Template/Template":16,"./Util_modules/Toast/Toast":17,"./Util_modules/Tooltips/Tooltips":18,"./Util_modules/TransformParamsToJSON/TransformParamsToJSON":19,"./Util_modules/ValidationEngine/ValidationEngine":20,"./Util_modules/ValidationEngine/ValidationEngineLanguageCN":21}]},{},[22])