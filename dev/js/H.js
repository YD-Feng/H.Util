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
     * domain 【String】 Cookie域
     * path 【String】 Cookie路径
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
        console.info(cookieArr.join(''));
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
     * domain 【String】 Cookie域
     * path 【String】 Cookie路径
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
        _this.itvTrigger(eventName, function () {
            fn(e);
        }, itvTime, this);
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
 * */
ItvEvents.prototype.itvTrigger = function (eventName, fn, itvTime, fnContextObj) {
    var _this = this,
        curTriggerTime = +new Date();   //当前要触发事件的时间点

    clearTimeout(_this.timeOut[eventName]);

    if (curTriggerTime - _this.lastTriggerTime[eventName] > itvTime) {
        _this.lastTriggerTime[eventName] = curTriggerTime;
        fn.call(fnContextObj);
    } else {
        _this.timeOut[eventName] = setTimeout(function () {
            fn.call(fnContextObj);
        }, itvTime);
    }
};

module.exports = ItvEvents;

},{}],5:[function(require,module,exports){
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

},{"../Monitor/Monitor":9}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{"./DelayedFunc":7}],9:[function(require,module,exports){
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
},{"./FuncDepot":8}],10:[function(require,module,exports){
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
    _this.wrapT &&_this.wrapT
        .on('click', '.J-page-to', function () {
            var pg = $(this).data('pg');
            if (pg) {
                _this.goToPageFunc(pg);
            }
        });

    _this.wrapB &&_this.wrapB
        .on('click', '.J-page-to', function () {
            var pg = $(this).data('pg');
            if (pg) {
                _this.goToPageFunc(pg);
            }
        });

    _this.bindEventFlag = false;
};

module.exports = Pager;

},{"../Template/Template":14}],11:[function(require,module,exports){
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
            alert('Storage Object create error!');
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
},{}],12:[function(require,module,exports){
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
            if (curCodeLength == codeLength) {
                _str = _str.substring(0, _endFlag);
                return true;
            } else if (curCodeLength > codeLength) {
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

},{}],13:[function(require,module,exports){
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
            console.info(options.curTarget);
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
            console.info(options.curTarget);
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

},{}],14:[function(require,module,exports){
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
    var template = function (data) {
        return render.call(this, data);
    };

    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
};

module.exports = template;

},{}],15:[function(require,module,exports){
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

},{"../Template/Template":14}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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
                errorFound = false, //错误标记，当校验出现错误，它会被设为true
                first_err = null; //用来缓存第一个出现报错的控件

            //触发 开始进行表单校验 钩子
            $form.trigger('jqv.form.validating');

            //对表单中包含校验标记的所有控件的值进行校验
            $form.find('[' + options.validateAttribute + '*=validate]').not(':disabled').each(function () {
                var $field = $(this),
                    names = []; //缓存已经验证过的控件类型

                //如果这一类（name属性相同的控件为同一类）控件还没进行验证
                if ($.inArray(this.name, names) < 0) {
                    errorFound |= methods._validateField($field, options);

                    if (errorFound && first_err == null) {
                        //如果尚未出现校验报错
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
            $form.trigger('jqv.form.result', [errorFound]);

            if (errorFound) {

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
            if ($field.is(':hidden') && !options.prettySelect && $field.is('select') || $field.parent().is(':hidden')) {
                return false;
            }

            var veRules = $field.attr(options.validateAttribute),
                veRulesList = /validate\[(.*)\]/.exec(veRules);

            if (!veRulesList) {
                return false;
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

                        case '_error_no_prompt':
                            //如果想抛出一个错误，但不展示提示信息气泡吗，返回true
                            return true;
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
                case 'select-multiple':
                case 'radio':*/
                case 'checkbox':
                    if (condRequired) {
                        if (!$field.attr('checked')) {
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
'use strict';
(function(window, $){
    //实例
    var Monitor = require('./Util_modules/Monitor/Monitor');
    var Storage = require('./Util_modules/Storage/Storage');
    var Cookie = require('./Util_modules/Cookie/Cookie');
    var ItvEvents = require('./Util_modules/ItvEvents/ItvEvents');
    var JsLoader = require('./Util_modules/JsLoader/JsLoader');
    var Tooltips = require('./Util_modules/Tooltips/Tooltips');
    var Loading = require('./Util_modules/Loading/Loading');

    //类
    var Switchable = require('./Util_modules/Switchable/Switchable');
    var Pager = require('./Util_modules/Pager/Pager');

    //方法
    var Template = require('./Util_modules/Template/Template');
    var GetStrCodeLength = require('./Util_modules/GetStrCodeLength/GetStrCodeLength');
    var SubStrByCode = require('./Util_modules/SubStrByCode/SubStrByCode');
    var TransformParamsToJSON = require('./Util_modules/TransformParamsToJSON/TransformParamsToJSON');

    //原生对象方法扩展
    var DateFormat = require('./Util_modules/DateFormat/DateFormat');

    //Jquery方法扩展
    var ValidationEngine = require('./Util_modules/ValidationEngine/ValidationEngine');
    var ValidationEngineLanguage = require('./Util_modules/ValidationEngine/ValidationEngineLanguageCN');

    window.H = window.H || {};

    //代理console.log
    H.log = function(msg){
        if(window["console"]){
            try{
                console.log.call(console, "%c" + msg, "font-size:14px; color:#C0A; font-family:微软雅黑; text-shadow:0px 1px 2px #ff0;");
            }catch(e){
                console.log(msg);
            }
        }
    };

    //实例
    H.Monitor = new Monitor();
    H.Storage = new Storage();
    H.ItvEvents = new ItvEvents();
    H.JsLoader = new JsLoader();
    H.Tooltips = Tooltips;
    H.Cookie = Cookie;
    H.Loading = Loading;

    //类
    H.Switchable = Switchable;
    H.Pager = Pager;

    //方法
    H.template = Template;
    H.getStrCodeLength = GetStrCodeLength;
    H.subStrByCode = SubStrByCode;
    H.transformParamsToJSON = TransformParamsToJSON;

    //原生对象方法扩展
    DateFormat();

    //Jquery方法扩展
    ValidationEngine($);
    ValidationEngineLanguage($);

    $.ajaxSetup({
        beforeSend: function () {
            if (this.showLoadingMask) {
                H.Loading.show();
            }
        },
        complete: function () {
            if (this.showLoadingMask) {
                H.Loading.hide();
            }
        }
    })

})(window, jQuery);

},{"./Util_modules/Cookie/Cookie":1,"./Util_modules/DateFormat/DateFormat":2,"./Util_modules/GetStrCodeLength/GetStrCodeLength":3,"./Util_modules/ItvEvents/ItvEvents":4,"./Util_modules/JsLoader/JsLoader":5,"./Util_modules/Loading/Loading":6,"./Util_modules/Monitor/Monitor":9,"./Util_modules/Pager/Pager":10,"./Util_modules/Storage/Storage":11,"./Util_modules/SubStrByCode/SubStrByCode":12,"./Util_modules/Switchable/Switchable":13,"./Util_modules/Template/Template":14,"./Util_modules/Tooltips/Tooltips":15,"./Util_modules/TransformParamsToJSON/TransformParamsToJSON":16,"./Util_modules/ValidationEngine/ValidationEngine":17,"./Util_modules/ValidationEngine/ValidationEngineLanguageCN":18}]},{},[19])
/*! artDialog v6.0.5 | https://github.com/aui/artDialog */
!(function () {

var __modules__ = {};

function require (id) {
    var mod = __modules__[id];
    var exports = 'exports';

    if (typeof mod === 'object') {
        return mod;
    }

    if (!mod[exports]) {
        mod[exports] = {};
        mod[exports] = mod.call(mod[exports], require, mod[exports], mod) || mod[exports];
    }

    return mod[exports];
}

function define (path, fn) {
    __modules__[path] = fn;
}



define("jquery", function () {
	return jQuery;
});


/*!
 * PopupJS
 * Date: 2014-11-09
 * https://github.com/aui/popupjs
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */

define("popup", function (require) {

var $ = require("jquery");

var _count = 0;
var _isIE6 = !('minWidth' in $('html')[0].style);
var _isFixed = !_isIE6;


function Popup () {

    this.destroyed = false;


    this.__popup = $('<div />')
    /*使用 <dialog /> 元素可能导致 z-index 永远置顶的问题(chrome)*/
    .css({
        display: 'none',
        position: 'absolute',
        /*
        left: 0,
        top: 0,
        bottom: 'auto',
        right: 'auto',
        margin: 0,
        padding: 0,
        border: '0 none',
        background: 'transparent'
        */
        outline: 0
    })
    .attr('tabindex', '-1')
    .html(this.innerHTML)
    .appendTo('body');


    this.__backdrop = this.__mask = $('<div />')
    .css({
        opacity: .7,
        background: '#000'
    });


    // 使用 HTMLElement 作为外部接口使用，而不是 jquery 对象
    // 统一的接口利于未来 Popup 移植到其他 DOM 库中
    this.node = this.__popup[0];
    this.backdrop = this.__backdrop[0];

    _count ++;
}


$.extend(Popup.prototype, {

    /**
     * 初始化完毕事件，在 show()、showModal() 执行
     * @name Popup.prototype.onshow
     * @event
     */

    /**
     * 关闭事件，在 close() 执行
     * @name Popup.prototype.onclose
     * @event
     */

    /**
     * 销毁前事件，在 remove() 前执行
     * @name Popup.prototype.onbeforeremove
     * @event
     */

    /**
     * 销毁事件，在 remove() 执行
     * @name Popup.prototype.onremove
     * @event
     */

    /**
     * 重置事件，在 reset() 执行
     * @name Popup.prototype.onreset
     * @event
     */

    /**
     * 焦点事件，在 foucs() 执行
     * @name Popup.prototype.onfocus
     * @event
     */

    /**
     * 失焦事件，在 blur() 执行
     * @name Popup.prototype.onblur
     * @event
     */

    /** 浮层 DOM 素节点[*] */
    node: null,

    /** 遮罩 DOM 节点[*] */
    backdrop: null,

    /** 是否开启固定定位[*] */
    fixed: false,

    /** 判断对话框是否删除[*] */
    destroyed: true,

    /** 判断对话框是否显示 */
    open: false,

    /** close 返回值 */
    returnValue: '',

    /** 是否自动聚焦 */
    autofocus: true,

    /** 对齐方式[*] */
    align: 'bottom left',

    /** 内部的 HTML 字符串 */
    innerHTML: '',

    /** CSS 类名 */
    className: 'ui-popup',

    /**
     * 显示浮层
     * @param   {HTMLElement, Event}  指定位置（可选）
     */
    show: function (anchor) {

        if (this.destroyed) {
            return this;
        }

        var that = this;
        var popup = this.__popup;
        var backdrop = this.__backdrop;

        this.__activeElement = this.__getActive();

        this.open = true;
        this.follow = anchor || this.follow;


        // 初始化 show 方法
        if (!this.__ready) {

            popup
            .addClass(this.className)
            .attr('role', this.modal ? 'alertdialog' : 'dialog')
            .css('position', this.fixed ? 'fixed' : 'absolute');

            if (!_isIE6) {
                $(window).on('resize', $.proxy(this.reset, this));
            }

            // 模态浮层的遮罩
            if (this.modal) {
                var backdropCss = {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    userSelect: 'none',
                    zIndex: this.zIndex || Popup.zIndex
                };


                popup.addClass(this.className + '-modal');


                if (!_isFixed) {
                    $.extend(backdropCss, {
                        position: 'absolute',
                        width: $(window).width() + 'px',
                        height: $(document).height() + 'px'
                    });
                }


                backdrop
                .css(backdropCss)
                .attr({tabindex: '0'})
                .on('focus', $.proxy(this.focus, this));

                // 锁定 tab 的焦点操作
                this.__mask = backdrop
                .clone(true)
                .attr('style', '')
                .insertAfter(popup);

                backdrop
                .addClass(this.className + '-backdrop')
                .insertBefore(popup);

                this.__ready = true;
            }


            if (!popup.html()) {
                popup.html(this.innerHTML);
            }
        }


        popup
        .addClass(this.className + '-show')
        .show();

        backdrop.show();


        this.reset().focus();
        this.__dispatchEvent('show');

        return this;
    },


    /** 显示模态浮层。参数参见 show() */
    showModal: function () {
        this.modal = true;
        return this.show.apply(this, arguments);
    },


    /** 关闭浮层 */
    close: function (result) {

        if (!this.destroyed && this.open) {

            if (result !== undefined) {
                this.returnValue = result;
            }

            this.__popup.hide().removeClass(this.className + '-show');
            this.__backdrop.hide();
            this.open = false;
            this.blur();// 恢复焦点，照顾键盘操作的用户
            this.__dispatchEvent('close');
        }

        return this;
    },


    /** 销毁浮层 */
    remove: function () {

        if (this.destroyed) {
            return this;
        }

        this.__dispatchEvent('beforeremove');

        if (Popup.current === this) {
            Popup.current = null;
        }


        // 从 DOM 中移除节点
        this.__popup.remove();
        this.__backdrop.remove();
        this.__mask.remove();


        if (!_isIE6) {
            $(window).off('resize', this.reset);
        }


        this.__dispatchEvent('remove');

        for (var i in this) {
            delete this[i];
        }

        return this;
    },


    /** 重置位置 */
    reset: function () {

        var elem = this.follow;

        if (elem) {
            this.__follow(elem);
        } else {
            this.__center();
        }

        this.__dispatchEvent('reset');

        return this;
    },


    /** 让浮层获取焦点 */
    focus: function () {

        var node = this.node;
        var popup = this.__popup;
        var current = Popup.current;
        var index = this.zIndex = Popup.zIndex ++;

        if (current && current !== this) {
            current.blur(false);
        }

        // 检查焦点是否在浮层里面
        if (!$.contains(node, this.__getActive())) {
            var autofocus = popup.find('[autofocus]')[0];

            if (!this._autofocus && autofocus) {
                this._autofocus = true;
            } else {
                autofocus = node;
            }

            this.__focus(autofocus);
        }

        // 设置叠加高度
        popup.css('zIndex', index);
        //this.__backdrop.css('zIndex', index);

        Popup.current = this;
        popup.addClass(this.className + '-focus');

        this.__dispatchEvent('focus');

        return this;
    },


    /** 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户 */
    blur: function () {

        var activeElement = this.__activeElement;
        var isBlur = arguments[0];


        if (isBlur !== false) {
            this.__focus(activeElement);
        }

        this._autofocus = false;
        this.__popup.removeClass(this.className + '-focus');
        this.__dispatchEvent('blur');

        return this;
    },


    /**
     * 添加事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    addEventListener: function (type, callback) {
        this.__getEventListener(type).push(callback);
        return this;
    },


    /**
     * 删除事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    removeEventListener: function (type, callback) {
        var listeners = this.__getEventListener(type);
        for (var i = 0; i < listeners.length; i ++) {
            if (callback === listeners[i]) {
                listeners.splice(i--, 1);
            }
        }
        return this;
    },


    // 获取事件缓存
    __getEventListener: function (type) {
        var listener = this.__listener;
        if (!listener) {
            listener = this.__listener = {};
        }
        if (!listener[type]) {
            listener[type] = [];
        }
        return listener[type];
    },


    // 派发事件
    __dispatchEvent: function (type) {
        var listeners = this.__getEventListener(type);

        if (this['on' + type]) {
            this['on' + type]();
        }

        for (var i = 0; i < listeners.length; i ++) {
            listeners[i].call(this);
        }
    },


    // 对元素安全聚焦
    __focus: function (elem) {
        // 防止 iframe 跨域无权限报错
        // 防止 IE 不可见元素报错
        try {
            // ie11 bug: iframe 页面点击会跳到顶部
            if (this.autofocus && !/^iframe$/i.test(elem.nodeName)) {
                elem.focus();
            }
        } catch (e) {}
    },


    // 获取当前焦点的元素
    __getActive: function () {
        try {// try: ie8~9, iframe #26
            var activeElement = document.activeElement;
            var contentDocument = activeElement.contentDocument;
            var elem = contentDocument && contentDocument.activeElement || activeElement;
            return elem;
        } catch (e) {}
    },


    // 居中浮层
    __center: function () {

        var popup = this.__popup;
        var $window = $(window);
        var $document = $(document);
        var fixed = this.fixed;
        var dl = fixed ? 0 : $document.scrollLeft();
        var dt = fixed ? 0 : $document.scrollTop();
        var ww = $window.width();
        var wh = $window.height();
        var ow = popup.width();
        var oh = popup.height();
        var left = (ww - ow) / 2 + dl;
        var top = (wh - oh) * 382 / 1000 + dt;// 黄金比例
        var style = popup[0].style;


        style.left = Math.max(parseInt(left), dl) + 'px';
        style.top = Math.max(parseInt(top), dt) + 'px';
    },


    // 指定位置 @param    {HTMLElement, Event}  anchor
    __follow: function (anchor) {

        var $elem = anchor.parentNode && $(anchor);
        var popup = this.__popup;


        if (this.__followSkin) {
            popup.removeClass(this.__followSkin);
        }


        // 隐藏元素不可用
        if ($elem) {
            var o = $elem.offset();
            if (o.left * o.top < 0) {
                return this.__center();
            }
        }

        var that = this;
        var fixed = this.fixed;

        var $window = $(window);
        var $document = $(document);
        var winWidth = $window.width();
        var winHeight = $window.height();
        var docLeft =  $document.scrollLeft();
        var docTop = $document.scrollTop();


        var popupWidth = popup.width();
        var popupHeight = popup.height();
        var width = $elem ? $elem.outerWidth() : 0;
        var height = $elem ? $elem.outerHeight() : 0;
        var offset = this.__offset(anchor);
        var x = offset.left;
        var y = offset.top;
        var left =  fixed ? x - docLeft : x;
        var top = fixed ? y - docTop : y;


        var minLeft = fixed ? 0 : docLeft;
        var minTop = fixed ? 0 : docTop;
        var maxLeft = minLeft + winWidth - popupWidth;
        var maxTop = minTop + winHeight - popupHeight;


        var css = {};
        var align = this.align.split(' ');
        var className = this.className + '-';
        var reverse = {top: 'bottom', bottom: 'top', left: 'right', right: 'left'};
        var name = {top: 'top', bottom: 'top', left: 'left', right: 'left'};


        var temp = [{
            top: top - popupHeight,
            bottom: top + height,
            left: left - popupWidth,
            right: left + width
        }, {
            top: top,
            bottom: top - popupHeight + height,
            left: left,
            right: left - popupWidth + width
        }];


        var center = {
            left: left + width / 2 - popupWidth / 2,
            top: top + height / 2 - popupHeight / 2
        };


        var range = {
            left: [minLeft, maxLeft],
            top: [minTop, maxTop]
        };


        // 超出可视区域重新适应位置
        $.each(align, function (i, val) {

            // 超出右或下边界：使用左或者上边对齐
            if (temp[i][val] > range[name[val]][1]) {
                val = align[i] = reverse[val];
            }

            // 超出左或右边界：使用右或者下边对齐
            if (temp[i][val] < range[name[val]][0]) {
                align[i] = reverse[val];
            }

        });


        // 一个参数的情况
        if (!align[1]) {
            name[align[1]] = name[align[0]] === 'left' ? 'top' : 'left';
            temp[1][align[1]] = center[name[align[1]]];
        }


        //添加follow的css, 为了给css使用
        className += align.join('-') + ' '+ this.className+ '-follow';

        that.__followSkin = className;


        if ($elem) {
            popup.addClass(className);
        }


        css[name[align[0]]] = parseInt(temp[0][align[0]]);
        css[name[align[1]]] = parseInt(temp[1][align[1]]);
        popup.css(css);

    },


    // 获取元素相对于页面的位置（包括iframe内的元素）
    // 暂时不支持两层以上的 iframe 套嵌
    __offset: function (anchor) {

        var isNode = anchor.parentNode;
        var offset = isNode ? $(anchor).offset() : {
            left: anchor.pageX,
            top: anchor.pageY
        };


        anchor = isNode ? anchor : anchor.target;
        var ownerDocument = anchor.ownerDocument;
        var defaultView = ownerDocument.defaultView || ownerDocument.parentWindow;

        if (defaultView == window) {// IE <= 8 只能使用两个等于号
            return offset;
        }

        // {Element: Ifarme}
        var frameElement = defaultView.frameElement;
        var $ownerDocument = $(ownerDocument);
        var docLeft =  $ownerDocument.scrollLeft();
        var docTop = $ownerDocument.scrollTop();
        var frameOffset = $(frameElement).offset();
        var frameLeft = frameOffset.left;
        var frameTop = frameOffset.top;

        return {
            left: offset.left + frameLeft - docLeft,
            top: offset.top + frameTop - docTop
        };
    }

});


/** 当前叠加高度 */
Popup.zIndex = 1024;


/** 顶层浮层的实例 */
Popup.current = null;


return Popup;

});

// artDialog - 默认配置
define("dialog-config", {

    /* -----已注释的配置继承自 popup.js，仍可以再这里重新定义它----- */

    // 对齐方式
    //align: 'bottom left',

    // 是否固定定位
    //fixed: false,

    // 对话框叠加高度值(重要：此值不能超过浏览器最大限制)
    //zIndex: 1024,

    // 设置遮罩背景颜色
    backdropBackground: '#000',

    // 设置遮罩透明度
    backdropOpacity: 0.7,

    // 消息内容
    content: '<span class="ui-dialog-loading">Loading..</span>',

    // 标题
    title: '',

    // 对话框状态栏区域 HTML 代码
    statusbar: '',

    // 自定义按钮
    button: null,

    // 确定按钮回调函数
    ok: null,

    // 取消按钮回调函数
    cancel: null,

    // 确定按钮文本
    okValue: 'ok',

    // 取消按钮文本
    cancelValue: 'cancel',

    cancelDisplay: true,

    // 内容宽度
    width: '',

    // 内容高度
    height: '',

    // 内容与边界填充距离
    padding: '',

    // 对话框自定义 className
    skin: '',

    // 是否支持快捷关闭（点击遮罩层自动关闭）
    quickClose: false,

    // css 文件路径，留空则不会使用 js 自动加载样式
    // 注意：css 只允许加载一个
    cssUri: '../css/ui-dialog.css',

    // 模板（使用 table 解决 IE7 宽度自适应的 BUG）
    // js 使用 i="***" 属性识别结构，其余的均可自定义
    innerHTML:
        '<div i="dialog" class="ui-dialog">'
        +       '<div class="ui-dialog-arrow-a"></div>'
        +       '<div class="ui-dialog-arrow-b"></div>'
        +       '<table class="ui-dialog-grid">'
        +           '<tr>'
        +               '<td i="header" class="ui-dialog-header">'
        +                   '<button i="close" class="ui-dialog-close">&#215;</button>'
        +                   '<div i="title" class="ui-dialog-title"></div>'
        +               '</td>'
        +           '</tr>'
        +           '<tr>'
        +               '<td i="body" class="ui-dialog-body">'
        +                   '<div i="content" class="ui-dialog-content"></div>'
        +               '</td>'
        +           '</tr>'
        +           '<tr>'
        +               '<td i="footer" class="ui-dialog-footer">'
        +                   '<div i="statusbar" class="ui-dialog-statusbar"></div>'
        +                   '<div i="button" class="ui-dialog-button"></div>'
        +               '</td>'
        +           '</tr>'
        +       '</table>'
        +'</div>'

});

/*!
 * artDialog
 * Date: 2014-11-09
 * https://github.com/aui/artDialog
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */
define("dialog", function (require) {

var $ = require("jquery");
var Popup = require("popup");
var defaults = require("dialog-config");
var css = defaults.cssUri;


// css loader: RequireJS & SeaJS
if (css) {
    var fn = require[require.toUrl ? 'toUrl' : 'resolve'];
    if (fn) {
        css = fn(css);
        css = '<link rel="stylesheet" href="' + css + '" />';
        if ($('base')[0]) {
            $('base').before(css);
        } else {
            $('head').append(css);
        }
    }
}


var _count = 0;
var _expando = new Date() - 0; // Date.now()
var _isIE6 = !('minWidth' in $('html')[0].style);
var _isMobile = 'createTouch' in document && !('onmousemove' in document)
    || /(iPhone|iPad|iPod)/i.test(navigator.userAgent);
var _isFixed = !_isIE6 && !_isMobile;


var artDialog = function (options, ok, cancel) {

    var originalOptions = options = options || {};


    if (typeof options === 'string' || options.nodeType === 1) {

        options = {content: options, fixed: !_isMobile};
    }


    options = $.extend(true, {}, artDialog.defaults, options);
    options.original = originalOptions;

    var id = options.id = options.id || _expando + _count;
    var api = artDialog.get(id);


    // 如果存在同名的对话框对象，则直接返回
    if (api) {
        return api.focus();
    }


    // 目前主流移动设备对fixed支持不好，禁用此特性
    if (!_isFixed) {
        options.fixed = false;
    }


    // 快捷关闭支持：点击对话框外快速关闭对话框
    if (options.quickClose) {
        options.modal = true;
        //options.backdropOpacity = 0;
    }


    // 按钮组
    if (!$.isArray(options.button)) {
        options.button = [];
    }


    // 取消按钮
    if (cancel !== undefined) {
        options.cancel = cancel;
    }

    if (options.cancel) {
        options.button.push({
            id: 'cancel',
            value: options.cancelValue,
            callback: options.cancel,
            display: options.cancelDisplay
        });
    }


    // 确定按钮
    if (ok !== undefined) {
        options.ok = ok;
    }

    if (options.ok) {
        options.button.push({
            id: 'ok',
            value: options.okValue,
            callback: options.ok,
            autofocus: true
        });
    }


    return artDialog.list[id] = new artDialog.create(options);
};

var popup = function () {};
popup.prototype = Popup.prototype;
var prototype = artDialog.prototype = new popup();

artDialog.create = function (options) {
    var that = this;

    $.extend(this, new Popup());

    var originalOptions = options.original;
    var $popup = $(this.node).html(options.innerHTML);
    var $backdrop = $(this.backdrop);

    this.options = options;
    this._popup = $popup;


    $.each(options, function (name, value) {
        if (typeof that[name] === 'function') {
            that[name](value);
        } else {
            that[name] = value;
        }
    });


    // 更新 zIndex 全局配置
    if (options.zIndex) {
        Popup.zIndex = options.zIndex;
    }


    // 设置 ARIA 信息
    $popup.attr({
        'aria-labelledby': this._$('title')
            .attr('id', 'title:' + this.id).attr('id'),
        'aria-describedby': this._$('content')
            .attr('id', 'content:' + this.id).attr('id')
    });


    // 关闭按钮
    this._$('close')
    .css('display', this.cancel === false ? 'none' : '')
    .attr('title', this.cancelValue)
    .on('click', function (event) {
        that._trigger('cancel');
        event.preventDefault();
    });


    // 添加视觉参数
    this._$('dialog').addClass(this.skin);
    this._$('body').css('padding', this.padding);


    // 点击任意空白处关闭对话框
    if (options.quickClose) {
        $backdrop
        .on(
            'onmousedown' in document ? 'mousedown' : 'click',
            function () {
            that._trigger('cancel');
            return false;// 阻止抢夺焦点
        });
    }


    // 遮罩设置
    this.addEventListener('show', function () {
        $backdrop.css({
            opacity: 0,
            background: options.backdropBackground
        }).animate(
            {opacity: options.backdropOpacity}
        , 150);
    });


    // ESC 快捷键关闭对话框
    this._esc = function (event) {
        var target = event.target;
        var nodeName = target.nodeName;
        var rinput = /^input|textarea$/i;
        var isTop = Popup.current === that;
        var keyCode = event.keyCode;

        // 避免输入状态中 ESC 误操作关闭
        if (!isTop || rinput.test(nodeName) && target.type !== 'button') {
            return;
        }

        if (keyCode === 27) {
            that._trigger('cancel');
        }
    };

    $(document).on('keydown', this._esc);
    this.addEventListener('remove', function () {
        $(document).off('keydown', this._esc);
        delete artDialog.list[this.id];
    });


    _count ++;

    artDialog.oncreate(this);

    return this;
};


artDialog.create.prototype = prototype;



$.extend(prototype, {

    /**
     * 显示对话框
     * @name artDialog.prototype.show
     * @param   {HTMLElement Object, Event Object}  指定位置（可选）
     */

    /**
     * 显示对话框（模态）
     * @name artDialog.prototype.showModal
     * @param   {HTMLElement Object, Event Object}  指定位置（可选）
     */

    /**
     * 关闭对话框
     * @name artDialog.prototype.close
     * @param   {String, Number}    返回值，可被 onclose 事件收取（可选）
     */

    /**
     * 销毁对话框
     * @name artDialog.prototype.remove
     */

    /**
     * 重置对话框位置
     * @name artDialog.prototype.reset
     */

    /**
     * 让对话框聚焦（同时置顶）
     * @name artDialog.prototype.focus
     */

    /**
     * 让对话框失焦（同时置顶）
     * @name artDialog.prototype.blur
     */

    /**
     * 添加事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     * @name artDialog.prototype.addEventListener
     */

    /**
     * 删除事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     * @name artDialog.prototype.removeEventListener
     */

    /**
     * 对话框显示事件，在 show()、showModal() 执行
     * @name artDialog.prototype.onshow
     * @event
     */

    /**
     * 关闭事件，在 close() 执行
     * @name artDialog.prototype.onclose
     * @event
     */

    /**
     * 销毁前事件，在 remove() 前执行
     * @name artDialog.prototype.onbeforeremove
     * @event
     */

    /**
     * 销毁事件，在 remove() 执行
     * @name artDialog.prototype.onremove
     * @event
     */

    /**
     * 重置事件，在 reset() 执行
     * @name artDialog.prototype.onreset
     * @event
     */

    /**
     * 焦点事件，在 foucs() 执行
     * @name artDialog.prototype.onfocus
     * @event
     */

    /**
     * 失焦事件，在 blur() 执行
     * @name artDialog.prototype.onblur
     * @event
     */


    /**
     * 设置内容
     * @param    {String, HTMLElement}   内容
     */
    content: function (html) {

        var $content = this._$('content');

        // HTMLElement
        if (typeof html === 'object') {
            html = $(html);
            $content.empty('').append(html.show());
            this.addEventListener('beforeremove', function () {
                $('body').append(html.hide());
            });
        // String
        } else {
            $content.html(html);
        }

        return this.reset();
    },


    /**
     * 设置标题
     * @param    {String}   标题内容
     */
    title: function (text) {
        this._$('title').text(text);
        this._$('header')[text ? 'show' : 'hide']();
        return this;
    },


    /** 设置宽度 */
    width: function (value) {
        this._$('content').css('width', value);
        return this.reset();
    },


    /** 设置高度 */
    height: function (value) {
        this._$('content').css('height', value);
        return this.reset();
    },


    /**
     * 设置按钮组
     * @param   {Array, String}
     * Options: value, callback, autofocus, disabled
     */
    button: function (args) {
        args = args || [];
        var that = this;
        var html = '';
        var number = 0;
        this.callbacks = {};


        if (typeof args === 'string') {
            html = args;
            number ++;
        } else {
            $.each(args, function (i, val) {

                var id = val.id = val.id || val.value;
                var style = '';
                that.callbacks[id] = val.callback;


                if (val.display === false) {
                    style = ' style="display:none"';
                } else {
                    number ++;
                }

                html +=
                  '<button'
                + ' type="button"'
                + ' i-id="' + id + '"'
                + style
                + (val.disabled ? ' disabled' : '')
                + (val.autofocus ? ' autofocus class="ui-dialog-autofocus"' : '')
                + '>'
                +   val.value
                + '</button>';

                that._$('button')
                .on('click', '[i-id=' + id +']', function (event) {
                    var $this = $(this);
                    if (!$this.attr('disabled')) {// IE BUG
                        that._trigger(id);
                    }

                    event.preventDefault();
                });

            });
        }

        this._$('button').html(html);
        this._$('footer')[number ? 'show' : 'hide']();

        return this;
    },


    statusbar: function (html) {
        this._$('statusbar')
        .html(html)[html ? 'show' : 'hide']();

        return this;
    },


    _$: function (i) {
        return this._popup.find('[i=' + i + ']');
    },


    // 触发按钮回调函数
    _trigger: function (id) {
        var fn = this.callbacks[id];

        return typeof fn !== 'function' || fn.call(this) !== false ?
            this.close().remove() : this;
    }

});



artDialog.oncreate = $.noop;



/** 获取最顶层的对话框API */
artDialog.getCurrent = function () {
    return Popup.current;
};



/**
 * 根据 ID 获取某对话框 API
 * @param    {String}    对话框 ID
 * @return   {Object}    对话框 API (实例)
 */
artDialog.get = function (id) {
    return id === undefined
    ? artDialog.list
    : artDialog.list[id];
};

artDialog.list = {};



/**
 * 默认配置
 */
artDialog.defaults = defaults;



return artDialog;

});




window.dialog = require("dialog");

window.H = window.H || {};

H.dialog = function (opts) {
    var inlineStyle = 'style="',
        onshowFunc = opts.onshow,
        onremoveFunc = opts.onremove,
        oncloseFunc = opts.onclose,
        noTitleCall = null,
        timeOutCall = null;

    delete opts.statusbar;

    if (typeof opts.removeFlag == 'undefined') {
        opts.removeFlag = true;
    } else {
        if (!opts.removeFlag) {
            opts.quickClose = false;
        }
    }

    if (typeof opts.showCloseBtn == 'undefined') {
        opts.showCloseBtn = true;
    }

    if (typeof opts.setMaxSize == 'undefined') {
        opts.setMaxSize = true;
    }

    if (opts.setMaxSize) {
        if (typeof opts.width == 'number') {
            inlineStyle += 'max-width: ' + opts.width + 'px;';
        }

        if (typeof opts.height == 'number') {
            inlineStyle += 'max-height: ' + opts.height + 'px;';
        }

        inlineStyle += '"';

        opts.content = '<div class="J-ui-dialog-max-heigh ui-dialog-max-height"' + inlineStyle + '>' + opts.content + '</div>';
    }

    if (typeof opts.title == 'undefined' && opts.showCloseBtn) {
        opts.padding = 0;

        if (opts.removeFlag) {
            opts.onremove = function () {
                var _this = this;
                onremoveFunc && onremoveFunc();
                $(document).off('click.dialogClose' + _this.id);
            };
        } else {
            opts.onclose = function () {
                var _this = this;
                oncloseFunc && oncloseFunc();
                $(document).off('click.dialogClose' + _this.id);
            };
        }


        noTitleCall = function () {
            var _this = this;
            $(document).on('click.dialogClose' + _this.id, '.J-ui-dialog-close-self', function () {
                if (_this && _this.options) {
                    if (_this.options.removeFlag) {
                        _this.remove();
                    } else {
                        _this.close();
                    }
                }
            });
        };

        opts.content = '<div class=\'ui-dialog-wrap\'><button btnType=\'close\' class=\'J-ui-dialog-close-self ui-dialog-close-self\'></button>' + opts.content + '</div>';
    } else {
        if (opts.removeFlag) {
            opts.onremove = function () {
                onremoveFunc && onremoveFunc();
            };
        } else {
            opts.onclose = function () {
                oncloseFunc && oncloseFunc();
            };
        }
    }

    if (typeof opts.timeout == 'number') {
        var timeout = opts.timeout;

        timeOutCall = function () {
            var _this = this;
            setTimeout(function () {
                if (_this && _this.options) {
                    if (_this.options.removeFlag) {
                        _this.remove();
                    } else {
                        _this.close()
                    }
                }

            }, timeout);
        };

        delete opts.timeout;
    }

    opts.onshow = function () {
        onshowFunc && onshowFunc();
        noTitleCall && noTitleCall.call(this);
        timeOutCall && timeOutCall.call(this);
    };

    var d = dialog(opts);

    return d;
};

H.alert = function (msg, timeout, callback) {
    var opts = {
        title: '提示',
        content: msg,
        timeout: typeof arguments[1] != 'number' ? 2000 : arguments[1],
        quickClose: true,
        backdropOpacity: 0,
        width: 300
    };

    if (typeof arguments[1] == 'function') {
        opts.onremove = arguments[1];
    } else if (typeof arguments[2] == 'function') {
        opts.onremove = arguments[2];
    }

    H.dialog(opts).show();
};

H.confirm = function (opts) {
    var okVal = opts.okValue,
        okFunc = opts.ok,
        cancelVal = opts.cancelValue,
        cancelFunc = opts.cancel;

    if (typeof opts.title != 'undefined') {
        delete opts.title;
    }

    delete opts.onshow;
    delete opts.statusbar;
    delete opts.okValue;
    delete opts.ok;
    delete opts.cancelValue;
    delete opts.cancel;
    opts.padding = 0;

    opts.button = [];

    if (typeof okVal != 'undefined' && typeof okFunc == 'function') {
        opts.button.push({
            value: okVal,
            callback: okFunc
        });
    }

    if (typeof cancelVal != 'undefined' && typeof cancelFunc == 'function') {
        opts.button.push({
            value: cancelVal,
            callback: cancelFunc
        });
    }

    opts.content = '<div class="ui-dialog-confirm">' + opts.content + '</div>';

    var d = H.dialog(opts);

    return d;
};

H.frameBox = function (opts) {
    var onshowFunc = opts.onshow,
        timeOutCall = null,
        now = new Date().valueOf();

    delete opts.statusbar;

    if (typeof opts.showCloseBtn == 'undefined') {
        opts.showCloseBtn = true;
    }

    opts.content = '<iframe frameborder="0" class="ui-dialog-iframe" id="iframe_' + now + '" name="iframe_' + now + '" src="' + opts.content + '"></iframe>';
    opts.padding = 0;

    if (typeof opts.title == 'undefined') {
        opts.title = 'FrameBox';
    }

    opts.onshow = function () {
        var iframe = $(this.node).find('iframe')[0],
            curDialog = dialog.get(this.id);

        var afterLoad = function(){
                var targetFrameDoc = window.frames[iframe.name] && window.frames[iframe.name].document || iframe.contentDocument,
                    resetHeight = $(targetFrameDoc).find('body').height() + 34,
                    flag = false;

                if (typeof opts.height == 'undefined' || opts.height == 0 || opts.height == '0px' || opts.height == '0%') {
                    flag = true;
                    if($(window).height() < resetHeight){
                        resetHeight = $(window).height();
                    }
                }else{
                    if(resetHeight > 0){
                        if(typeof opts.height == 'number'){
                            flag = true;
                            if (opts.height <= resetHeight) {
                                resetHeight = opts.height;
                            }
                        }else if(typeof opts.height == 'string' && opts.height.indexOf('px') != -1){
                            flag = true;
                            if (opts.height.split('px')[0] * 1 <= resetHeight) {
                                resetHeight = opts.height.split('px')[0] * 1;
                            }
                        }else if(typeof opts.height == 'string' && opts.height.indexOf('%') != -1){
                            flag = true;
                            if (opts.height.split('%')[0] / 100 * $(window).height() <= resetHeight) {
                                resetHeight = opts.height.split('%')[0] / 100 * $(window).height();
                            }
                        }
                    }
                }

                if (flag) {
                    curDialog.height(resetHeight);
                    curDialog.reset();
                }

            };

        $(iframe).on('load', function(){
            afterLoad();
        });

        onshowFunc && onshowFunc();
        timeOutCall && timeOutCall.call(this);
    };

    var d = dialog(opts);

    return d;
};

})();

/*! jQuery UI - v1.11.4 - 2015-08-31
* http://jqueryui.com
* Includes: core.js, widget.js, mouse.js, position.js, datepicker.js, menu.js, selectmenu.js, slider.js
* Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
/*!
 * jQuery UI Core 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */


// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.11.4",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	scrollParent: function( includeHidden ) {
		var position = this.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = this.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
			}).eq( 0 );

		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
	},

	uniqueId: (function() {
		var uuid = 0;

		return function() {
			return this.each(function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			});
		};
	})(),

	removeUniqueId: function() {
		return this.each(function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
		return !!img && visible( img );
	}
	return ( /^(input|select|textarea|button|object)$/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}

// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	disableSelection: (function() {
		var eventType = "onselectstart" in document.createElement( "div" ) ?
			"selectstart" :
			"mousedown";

		return function() {
			return this.bind( eventType + ".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
		};
	})(),

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	}
});

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
$.ui.plugin = {
	add: function( module, option, set ) {
		var i,
			proto = $.ui[ module ].prototype;
		for ( i in set ) {
			proto.plugins[ i ] = proto.plugins[ i ] || [];
			proto.plugins[ i ].push( [ option, set[ i ] ] );
		}
	},
	call: function( instance, name, args, allowDisconnected ) {
		var i,
			set = instance.plugins[ name ];

		if ( !set ) {
			return;
		}

		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
			return;
		}

		for ( i = 0; i < set.length; i++ ) {
			if ( instance.options[ set[ i ][ 0 ] ] ) {
				set[ i ][ 1 ].apply( instance.element, args );
			}
		}
	}
};


/*!
 * jQuery UI Widget 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */


var widget_uuid = 0,
	widget_slice = Array.prototype.slice;

$.cleanData = (function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
})( $.cleanData );

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widget_slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = widget_slice.call( arguments, 1 ),
			returnValue = this;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( options === "instance" ) {
					returnValue = instance;
					return false;
				}
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat(args) );
			}

			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widget_uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled", !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this.hoverable.removeClass( "ui-state-hover" );
				this.focusable.removeClass( "ui-state-focus" );
			}
		}

		return this;
	},

	enable: function() {
		return this._setOptions({ disabled: false });
	},
	disable: function() {
		return this._setOptions({ disabled: true });
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			!this.isLtIE8 && event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

var widget = $.widget;


/*!
 * jQuery UI Mouse 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 */


var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

var mouse = $.widget("ui.mouse", {
	version: "1.11.4",
	options: {
		cancel: "input,textarea,button,select,option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind("mousedown." + this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind("click." + this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("." + this.widgetName);
		if ( this._mouseMoveDelegate ) {
			this.document
				.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if ( mouseHandled ) {
			return;
		}

		this._mouseMoved = false;

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};

		this.document
			.bind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.bind( "mouseup." + this.widgetName, this._mouseUpDelegate );

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// Only check for mouseups outside the document if you've moved inside the document
		// at least once. This prevents the firing of mouseup in the case of IE<9, which will
		// fire a mousemove event if content is placed under the cursor. See #7778
		// Support: IE <9
		if ( this._mouseMoved ) {
			// IE mouseup check - mouseup happened when mouse was out of window
			if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
				return this._mouseUp(event);

			// Iframe mouseup check - mouseup occurred in another document
			} else if ( !event.which ) {
				return this._mouseUp( event );
			}
		}

		if ( event.which || event.button ) {
			this._mouseMoved = true;
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		this.document
			.unbind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.unbind( "mouseup." + this.widgetName, this._mouseUpDelegate );

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		mouseHandled = false;
		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});


/*!
 * jQuery UI Position 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

(function() {

$.ui = $.ui || {};

var cachedScrollbarWidth, supportsOffsetFractions,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[0];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),

			// support: jQuery 1.6.x
			// jQuery 1.6 doesn't support .outerWidth/Height() on documents or windows
			width: isWindow || isDocument ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow || isDocument ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[0].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !supportsOffsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function() {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	supportsOffsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

})();

var position = $.ui.position;


/*!
 * jQuery UI Datepicker 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/datepicker/
 */


$.extend($.ui, { datepicker: { version: "1.11.4" } });

var datepicker_instActive;

function datepicker_getZindex( elem ) {
	var position, value;
	while ( elem.length && elem[ 0 ] !== document ) {
		// Ignore z-index if position is set to a value where z-index is ignored by the browser
		// This makes behavior of this function consistent across browsers
		// WebKit always returns auto if the element is positioned
		position = elem.css( "position" );
		if ( position === "absolute" || position === "relative" || position === "fixed" ) {
			// IE returns 0 when zIndex is not specified
			// other browsers return a string
			// we ignore the case of nested elements with an explicit value of 0
			// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
			value = parseInt( elem.css( "zIndex" ), 10 );
			if ( !isNaN( value ) && value !== 0 ) {
				return value;
			}
		}
		elem = elem.parent();
	}

	return 0;
}
/* Date picker manager.
   Use the singleton instance of this class, $.datepicker, to interact with the date picker.
   Settings for (groups of) date pickers are maintained in an instance object,
   allowing multiple different settings on the same page. */

function Datepicker() {
	this._curInst = null; // The current instance in use
	this._keyEvent = false; // If the last event was a key event
	this._disabledInputs = []; // List of date picker inputs that have been disabled
	this._datepickerShowing = false; // True if the popup picker is showing , false if not
	this._inDialog = false; // True if showing within a "dialog", false if not
	this._mainDivId = "ui-datepicker-div"; // The ID of the main datepicker division
	this._inlineClass = "ui-datepicker-inline"; // The name of the inline marker class
	this._appendClass = "ui-datepicker-append"; // The name of the append marker class
	this._triggerClass = "ui-datepicker-trigger"; // The name of the trigger marker class
	this._dialogClass = "ui-datepicker-dialog"; // The name of the dialog marker class
	this._disableClass = "ui-datepicker-disabled"; // The name of the disabled covering marker class
	this._unselectableClass = "ui-datepicker-unselectable"; // The name of the unselectable cell marker class
	this._currentClass = "ui-datepicker-current-day"; // The name of the current day marker class
	this._dayOverClass = "ui-datepicker-days-cell-over"; // The name of the day hover marker class
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[""] = { // Default regional settings
		closeText: "Done", // Display text for close link
		prevText: "Prev", // Display text for previous month link
		nextText: "Next", // Display text for next month link
		currentText: "Today", // Display text for current month link
		monthNames: ["January","February","March","April","May","June",
			"July","August","September","October","November","December"], // Names of months for drop-down and formatting
		monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // For formatting
		dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // For formatting
		dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // For formatting
		dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"], // Column headings for days starting at Sunday
		weekHeader: "Wk", // Column header for week of the year
		dateFormat: "mm/dd/yy", // See format options on parseDate
		firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
		isRTL: false, // True if right-to-left language, false if left-to-right
		showMonthAfterYear: false, // True if the year select precedes month, false for month then year
		yearSuffix: "" // Additional text to append to the year in the month headers
	};
	this._defaults = { // Global defaults for all the date picker instances
		showOn: "focus", // "focus" for popup on focus,
			// "button" for trigger button, or "both" for either
		showAnim: "fadeIn", // Name of jQuery animation for popup
		showOptions: {}, // Options for enhanced animations
		defaultDate: null, // Used when field is blank: actual date,
			// +/-number for offset from today, null for today
		appendText: "", // Display text following the input box, e.g. showing the format
		buttonText: "...", // Text for trigger button
		buttonImage: "", // URL for trigger button image
		buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
		hideIfNoPrevNext: false, // True to hide next/previous month links
			// if not applicable, false to just disable them
		navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
		gotoCurrent: false, // True if today link goes back to current selection instead
		changeMonth: false, // True if month can be selected directly, false if only prev/next
		changeYear: false, // True if year can be selected directly, false if only prev/next
		yearRange: "c-10:c+10", // Range of years to display in drop-down,
			// either relative to today's year (-nn:+nn), relative to currently displayed year
			// (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
		showOtherMonths: false, // True to show dates in other months, false to leave blank
		selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
		showWeek: false, // True to show week of the year, false to not show it
		calculateWeek: this.iso8601Week, // How to calculate the week of the year,
			// takes a Date and returns the number of the week for it
		shortYearCutoff: "+10", // Short year values < this are in the current century,
			// > this are in the previous century,
			// string value starting with "+" for current year + value
		minDate: null, // The earliest selectable date, or null for no limit
		maxDate: null, // The latest selectable date, or null for no limit
		duration: "fast", // Duration of display/closure
		beforeShowDay: null, // Function that takes a date and returns an array with
			// [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
			// [2] = cell title (optional), e.g. $.datepicker.noWeekends
		beforeShow: null, // Function that takes an input field and
			// returns a set of custom settings for the date picker
		onSelect: null, // Define a callback function when a date is selected
		onChangeMonthYear: null, // Define a callback function when the month or year is changed
		onClose: null, // Define a callback function when the datepicker is closed
		numberOfMonths: 1, // Number of months to show at a time
		showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
		stepMonths: 1, // Number of months to step back/forward
		stepBigMonths: 12, // Number of months to step back/forward for the big links
		altField: "", // Selector for an alternate field to store selected dates into
		altFormat: "", // The date format to use for the alternate field
		constrainInput: true, // The input is constrained by the current date format
		showButtonPanel: false, // True to show button panel, false to not show it
		autoSize: false, // True to size the input for the date format, false to leave as is
		disabled: false // The initial disabled state
	};
	$.extend(this._defaults, this.regional[""]);
	this.regional.en = $.extend( true, {}, this.regional[ "" ]);
	this.regional[ "en-US" ] = $.extend( true, {}, this.regional.en );
	this.dpDiv = datepicker_bindHover($("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"));
}

$.extend(Datepicker.prototype, {
	/* Class name added to elements to indicate already configured with a date picker. */
	markerClassName: "hasDatepicker",

	//Keep track of the maximum number of rows displayed (see #7043)
	maxRows: 4,

	// TODO rename to "widget" when switching to widget factory
	_widgetDatepicker: function() {
		return this.dpDiv;
	},

	/* Override the default settings for all instances of the date picker.
	 * @param  settings  object - the new settings to use as defaults (anonymous object)
	 * @return the manager object
	 */
	setDefaults: function(settings) {
		datepicker_extendRemove(this._defaults, settings || {});
		return this;
	},

	/* Attach the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 * @param  settings  object - the new settings to use for this date picker instance (anonymous)
	 */
	_attachDatepicker: function(target, settings) {
		var nodeName, inline, inst;
		nodeName = target.nodeName.toLowerCase();
		inline = (nodeName === "div" || nodeName === "span");
		if (!target.id) {
			this.uuid += 1;
			target.id = "dp" + this.uuid;
		}
		inst = this._newInst($(target), inline);
		inst.settings = $.extend({}, settings || {});
		if (nodeName === "input") {
			this._connectDatepicker(target, inst);
		} else if (inline) {
			this._inlineDatepicker(target, inst);
		}
	},

	/* Create a new instance object. */
	_newInst: function(target, inline) {
		var id = target[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1"); // escape jQuery meta chars
		return {id: id, input: target, // associated target
			selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
			drawMonth: 0, drawYear: 0, // month being drawn
			inline: inline, // is datepicker inline or not
			dpDiv: (!inline ? this.dpDiv : // presentation div
			datepicker_bindHover($("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")))};
	},

	/* Attach the date picker to an input field. */
	_connectDatepicker: function(target, inst) {
		var input = $(target);
		inst.append = $([]);
		inst.trigger = $([]);
		if (input.hasClass(this.markerClassName)) {
			return;
		}
		this._attachments(input, inst);
		input.addClass(this.markerClassName).keydown(this._doKeyDown).
			keypress(this._doKeyPress).keyup(this._doKeyUp);
		this._autoSize(inst);
		$.data(target, "datepicker", inst);
		//If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
		if( inst.settings.disabled ) {
			this._disableDatepicker( target );
		}
	},

	/* Make attachments based on settings. */
	_attachments: function(input, inst) {
		var showOn, buttonText, buttonImage,
			appendText = this._get(inst, "appendText"),
			isRTL = this._get(inst, "isRTL");

		if (inst.append) {
			inst.append.remove();
		}
		if (appendText) {
			inst.append = $("<span class='" + this._appendClass + "'>" + appendText + "</span>");
			input[isRTL ? "before" : "after"](inst.append);
		}

		input.unbind("focus", this._showDatepicker);

		if (inst.trigger) {
			inst.trigger.remove();
		}

		showOn = this._get(inst, "showOn");
		if (showOn === "focus" || showOn === "both") { // pop-up date picker when in the marked field
			input.focus(this._showDatepicker);
		}
		if (showOn === "button" || showOn === "both") { // pop-up date picker when button clicked
			buttonText = this._get(inst, "buttonText");
			buttonImage = this._get(inst, "buttonImage");
			inst.trigger = $(this._get(inst, "buttonImageOnly") ?
				$("<img/>").addClass(this._triggerClass).
					attr({ src: buttonImage, alt: buttonText, title: buttonText }) :
				$("<button type='button'></button>").addClass(this._triggerClass).
					html(!buttonImage ? buttonText : $("<img/>").attr(
					{ src:buttonImage, alt:buttonText, title:buttonText })));
			input[isRTL ? "before" : "after"](inst.trigger);
			inst.trigger.click(function() {
				if ($.datepicker._datepickerShowing && $.datepicker._lastInput === input[0]) {
					$.datepicker._hideDatepicker();
				} else if ($.datepicker._datepickerShowing && $.datepicker._lastInput !== input[0]) {
					$.datepicker._hideDatepicker();
					$.datepicker._showDatepicker(input[0]);
				} else {
					$.datepicker._showDatepicker(input[0]);
				}
				return false;
			});
		}
	},

	/* Apply the maximum length for the date format. */
	_autoSize: function(inst) {
		if (this._get(inst, "autoSize") && !inst.inline) {
			var findMax, max, maxI, i,
				date = new Date(2009, 12 - 1, 20), // Ensure double digits
				dateFormat = this._get(inst, "dateFormat");

			if (dateFormat.match(/[DM]/)) {
				findMax = function(names) {
					max = 0;
					maxI = 0;
					for (i = 0; i < names.length; i++) {
						if (names[i].length > max) {
							max = names[i].length;
							maxI = i;
						}
					}
					return maxI;
				};
				date.setMonth(findMax(this._get(inst, (dateFormat.match(/MM/) ?
					"monthNames" : "monthNamesShort"))));
				date.setDate(findMax(this._get(inst, (dateFormat.match(/DD/) ?
					"dayNames" : "dayNamesShort"))) + 20 - date.getDay());
			}
			inst.input.attr("size", this._formatDate(inst, date).length);
		}
	},

	/* Attach an inline date picker to a div. */
	_inlineDatepicker: function(target, inst) {
		var divSpan = $(target);
		if (divSpan.hasClass(this.markerClassName)) {
			return;
		}
		divSpan.addClass(this.markerClassName).append(inst.dpDiv);
		$.data(target, "datepicker", inst);
		this._setDate(inst, this._getDefaultDate(inst), true);
		this._updateDatepicker(inst);
		this._updateAlternate(inst);
		//If disabled option is true, disable the datepicker before showing it (see ticket #5665)
		if( inst.settings.disabled ) {
			this._disableDatepicker( target );
		}
		// Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
		// http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
		inst.dpDiv.css( "display", "block" );
	},

	/* Pop-up the date picker in a "dialog" box.
	 * @param  input element - ignored
	 * @param  date	string or Date - the initial date to display
	 * @param  onSelect  function - the function to call when a date is selected
	 * @param  settings  object - update the dialog date picker instance's settings (anonymous object)
	 * @param  pos int[2] - coordinates for the dialog's position within the screen or
	 *					event - with x/y coordinates or
	 *					leave empty for default (screen centre)
	 * @return the manager object
	 */
	_dialogDatepicker: function(input, date, onSelect, settings, pos) {
		var id, browserWidth, browserHeight, scrollX, scrollY,
			inst = this._dialogInst; // internal instance

		if (!inst) {
			this.uuid += 1;
			id = "dp" + this.uuid;
			this._dialogInput = $("<input type='text' id='" + id +
				"' style='position: absolute; top: -100px; width: 0px;'/>");
			this._dialogInput.keydown(this._doKeyDown);
			$("body").append(this._dialogInput);
			inst = this._dialogInst = this._newInst(this._dialogInput, false);
			inst.settings = {};
			$.data(this._dialogInput[0], "datepicker", inst);
		}
		datepicker_extendRemove(inst.settings, settings || {});
		date = (date && date.constructor === Date ? this._formatDate(inst, date) : date);
		this._dialogInput.val(date);

		this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
		if (!this._pos) {
			browserWidth = document.documentElement.clientWidth;
			browserHeight = document.documentElement.clientHeight;
			scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			this._pos = // should use actual width/height below
				[(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
		}

		// move input on screen for focus, but hidden behind dialog
		this._dialogInput.css("left", (this._pos[0] + 20) + "px").css("top", this._pos[1] + "px");
		inst.settings.onSelect = onSelect;
		this._inDialog = true;
		this.dpDiv.addClass(this._dialogClass);
		this._showDatepicker(this._dialogInput[0]);
		if ($.blockUI) {
			$.blockUI(this.dpDiv);
		}
		$.data(this._dialogInput[0], "datepicker", inst);
		return this;
	},

	/* Detach a datepicker from its control.
	 * @param  target	element - the target input field or division or span
	 */
	_destroyDatepicker: function(target) {
		var nodeName,
			$target = $(target),
			inst = $.data(target, "datepicker");

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		$.removeData(target, "datepicker");
		if (nodeName === "input") {
			inst.append.remove();
			inst.trigger.remove();
			$target.removeClass(this.markerClassName).
				unbind("focus", this._showDatepicker).
				unbind("keydown", this._doKeyDown).
				unbind("keypress", this._doKeyPress).
				unbind("keyup", this._doKeyUp);
		} else if (nodeName === "div" || nodeName === "span") {
			$target.removeClass(this.markerClassName).empty();
		}

		if ( datepicker_instActive === inst ) {
			datepicker_instActive = null;
		}
	},

	/* Enable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */
	_enableDatepicker: function(target) {
		var nodeName, inline,
			$target = $(target),
			inst = $.data(target, "datepicker");

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		if (nodeName === "input") {
			target.disabled = false;
			inst.trigger.filter("button").
				each(function() { this.disabled = false; }).end().
				filter("img").css({opacity: "1.0", cursor: ""});
		} else if (nodeName === "div" || nodeName === "span") {
			inline = $target.children("." + this._inlineClass);
			inline.children().removeClass("ui-state-disabled");
			inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
				prop("disabled", false);
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value === target ? null : value); }); // delete entry
	},

	/* Disable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */
	_disableDatepicker: function(target) {
		var nodeName, inline,
			$target = $(target),
			inst = $.data(target, "datepicker");

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		if (nodeName === "input") {
			target.disabled = true;
			inst.trigger.filter("button").
				each(function() { this.disabled = true; }).end().
				filter("img").css({opacity: "0.5", cursor: "default"});
		} else if (nodeName === "div" || nodeName === "span") {
			inline = $target.children("." + this._inlineClass);
			inline.children().addClass("ui-state-disabled");
			inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
				prop("disabled", true);
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value === target ? null : value); }); // delete entry
		this._disabledInputs[this._disabledInputs.length] = target;
	},

	/* Is the first field in a jQuery collection disabled as a datepicker?
	 * @param  target	element - the target input field or division or span
	 * @return boolean - true if disabled, false if enabled
	 */
	_isDisabledDatepicker: function(target) {
		if (!target) {
			return false;
		}
		for (var i = 0; i < this._disabledInputs.length; i++) {
			if (this._disabledInputs[i] === target) {
				return true;
			}
		}
		return false;
	},

	/* Retrieve the instance data for the target control.
	 * @param  target  element - the target input field or division or span
	 * @return  object - the associated instance data
	 * @throws  error if a jQuery problem getting data
	 */
	_getInst: function(target) {
		try {
			return $.data(target, "datepicker");
		}
		catch (err) {
			throw "Missing instance data for this datepicker";
		}
	},

	/* Update or retrieve the settings for a date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 * @param  name	object - the new settings to update or
	 *				string - the name of the setting to change or retrieve,
	 *				when retrieving also "all" for all instance settings or
	 *				"defaults" for all global defaults
	 * @param  value   any - the new value for the setting
	 *				(omit if above is an object or to retrieve a value)
	 */
	_optionDatepicker: function(target, name, value) {
		var settings, date, minDate, maxDate,
			inst = this._getInst(target);

		if (arguments.length === 2 && typeof name === "string") {
			return (name === "defaults" ? $.extend({}, $.datepicker._defaults) :
				(inst ? (name === "all" ? $.extend({}, inst.settings) :
				this._get(inst, name)) : null));
		}

		settings = name || {};
		if (typeof name === "string") {
			settings = {};
			settings[name] = value;
		}

		if (inst) {
			if (this._curInst === inst) {
				this._hideDatepicker();
			}

			date = this._getDateDatepicker(target, true);
			minDate = this._getMinMaxDate(inst, "min");
			maxDate = this._getMinMaxDate(inst, "max");
			datepicker_extendRemove(inst.settings, settings);
			// reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
			if (minDate !== null && settings.dateFormat !== undefined && settings.minDate === undefined) {
				inst.settings.minDate = this._formatDate(inst, minDate);
			}
			if (maxDate !== null && settings.dateFormat !== undefined && settings.maxDate === undefined) {
				inst.settings.maxDate = this._formatDate(inst, maxDate);
			}
			if ( "disabled" in settings ) {
				if ( settings.disabled ) {
					this._disableDatepicker(target);
				} else {
					this._enableDatepicker(target);
				}
			}
			this._attachments($(target), inst);
			this._autoSize(inst);
			this._setDate(inst, date);
			this._updateAlternate(inst);
			this._updateDatepicker(inst);
		}
	},

	// change method deprecated
	_changeDatepicker: function(target, name, value) {
		this._optionDatepicker(target, name, value);
	},

	/* Redraw the date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 */
	_refreshDatepicker: function(target) {
		var inst = this._getInst(target);
		if (inst) {
			this._updateDatepicker(inst);
		}
	},

	/* Set the dates for a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  date	Date - the new date
	 */
	_setDateDatepicker: function(target, date) {
		var inst = this._getInst(target);
		if (inst) {
			this._setDate(inst, date);
			this._updateDatepicker(inst);
			this._updateAlternate(inst);
		}
	},

	/* Get the date(s) for the first entry in a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  noDefault boolean - true if no default date is to be used
	 * @return Date - the current date
	 */
	_getDateDatepicker: function(target, noDefault) {
		var inst = this._getInst(target);
		if (inst && !inst.inline) {
			this._setDateFromField(inst, noDefault);
		}
		return (inst ? this._getDate(inst) : null);
	},

	/* Handle keystrokes. */
	_doKeyDown: function(event) {
		var onSelect, dateStr, sel,
			inst = $.datepicker._getInst(event.target),
			handled = true,
			isRTL = inst.dpDiv.is(".ui-datepicker-rtl");

		inst._keyEvent = true;
		if ($.datepicker._datepickerShowing) {
			switch (event.keyCode) {
				case 9: $.datepicker._hideDatepicker();
						handled = false;
						break; // hide on tab out
				case 13: sel = $("td." + $.datepicker._dayOverClass + ":not(." +
									$.datepicker._currentClass + ")", inst.dpDiv);
						if (sel[0]) {
							$.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel[0]);
						}

						onSelect = $.datepicker._get(inst, "onSelect");
						if (onSelect) {
							dateStr = $.datepicker._formatDate(inst);

							// trigger custom callback
							onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
						} else {
							$.datepicker._hideDatepicker();
						}

						return false; // don't submit the form
				case 27: $.datepicker._hideDatepicker();
						break; // hide on escape
				case 33: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							-$.datepicker._get(inst, "stepBigMonths") :
							-$.datepicker._get(inst, "stepMonths")), "M");
						break; // previous month/year on page up/+ ctrl
				case 34: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							+$.datepicker._get(inst, "stepBigMonths") :
							+$.datepicker._get(inst, "stepMonths")), "M");
						break; // next month/year on page down/+ ctrl
				case 35: if (event.ctrlKey || event.metaKey) {
							$.datepicker._clearDate(event.target);
						}
						handled = event.ctrlKey || event.metaKey;
						break; // clear on ctrl or command +end
				case 36: if (event.ctrlKey || event.metaKey) {
							$.datepicker._gotoToday(event.target);
						}
						handled = event.ctrlKey || event.metaKey;
						break; // current on ctrl or command +home
				case 37: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), "D");
						}
						handled = event.ctrlKey || event.metaKey;
						// -1 day on ctrl or command +left
						if (event.originalEvent.altKey) {
							$.datepicker._adjustDate(event.target, (event.ctrlKey ?
								-$.datepicker._get(inst, "stepBigMonths") :
								-$.datepicker._get(inst, "stepMonths")), "M");
						}
						// next month/year on alt +left on Mac
						break;
				case 38: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, -7, "D");
						}
						handled = event.ctrlKey || event.metaKey;
						break; // -1 week on ctrl or command +up
				case 39: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), "D");
						}
						handled = event.ctrlKey || event.metaKey;
						// +1 day on ctrl or command +right
						if (event.originalEvent.altKey) {
							$.datepicker._adjustDate(event.target, (event.ctrlKey ?
								+$.datepicker._get(inst, "stepBigMonths") :
								+$.datepicker._get(inst, "stepMonths")), "M");
						}
						// next month/year on alt +right
						break;
				case 40: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, +7, "D");
						}
						handled = event.ctrlKey || event.metaKey;
						break; // +1 week on ctrl or command +down
				default: handled = false;
			}
		} else if (event.keyCode === 36 && event.ctrlKey) { // display the date picker on ctrl+home
			$.datepicker._showDatepicker(this);
		} else {
			handled = false;
		}

		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
	},

	/* Filter entered characters - based on date format. */
	_doKeyPress: function(event) {
		var chars, chr,
			inst = $.datepicker._getInst(event.target);

		if ($.datepicker._get(inst, "constrainInput")) {
			chars = $.datepicker._possibleChars($.datepicker._get(inst, "dateFormat"));
			chr = String.fromCharCode(event.charCode == null ? event.keyCode : event.charCode);
			return event.ctrlKey || event.metaKey || (chr < " " || !chars || chars.indexOf(chr) > -1);
		}
	},

	/* Synchronise manual entry and field/alternate field. */
	_doKeyUp: function(event) {
		var date,
			inst = $.datepicker._getInst(event.target);

		if (inst.input.val() !== inst.lastVal) {
			try {
				date = $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"),
					(inst.input ? inst.input.val() : null),
					$.datepicker._getFormatConfig(inst));

				if (date) { // only if valid
					$.datepicker._setDateFromField(inst);
					$.datepicker._updateAlternate(inst);
					$.datepicker._updateDatepicker(inst);
				}
			}
			catch (err) {
			}
		}
		return true;
	},

	/* Pop-up the date picker for a given input field.
	 * If false returned from beforeShow event handler do not show.
	 * @param  input  element - the input field attached to the date picker or
	 *					event - if triggered by focus
	 */
	_showDatepicker: function(input) {
		input = input.target || input;
		if (input.nodeName.toLowerCase() !== "input") { // find from button/image trigger
			input = $("input", input.parentNode)[0];
		}

		if ($.datepicker._isDisabledDatepicker(input) || $.datepicker._lastInput === input) { // already here
			return;
		}

		var inst, beforeShow, beforeShowSettings, isFixed,
			offset, showAnim, duration;

		inst = $.datepicker._getInst(input);
		if ($.datepicker._curInst && $.datepicker._curInst !== inst) {
			$.datepicker._curInst.dpDiv.stop(true, true);
			if ( inst && $.datepicker._datepickerShowing ) {
				$.datepicker._hideDatepicker( $.datepicker._curInst.input[0] );
			}
		}

		beforeShow = $.datepicker._get(inst, "beforeShow");
		beforeShowSettings = beforeShow ? beforeShow.apply(input, [input, inst]) : {};
		if(beforeShowSettings === false){
			return;
		}
		datepicker_extendRemove(inst.settings, beforeShowSettings);

		inst.lastVal = null;
		$.datepicker._lastInput = input;
		$.datepicker._setDateFromField(inst);

		if ($.datepicker._inDialog) { // hide cursor
			input.value = "";
		}
		if (!$.datepicker._pos) { // position below input
			$.datepicker._pos = $.datepicker._findPos(input);
			$.datepicker._pos[1] += input.offsetHeight; // add the height
		}

		isFixed = false;
		$(input).parents().each(function() {
			isFixed |= $(this).css("position") === "fixed";
			return !isFixed;
		});

		offset = {left: $.datepicker._pos[0], top: $.datepicker._pos[1]};
		$.datepicker._pos = null;
		//to avoid flashes on Firefox
		inst.dpDiv.empty();
		// determine sizing offscreen
		inst.dpDiv.css({position: "absolute", display: "block", top: "-1000px"});
		$.datepicker._updateDatepicker(inst);
		// fix width for dynamic number of date pickers
		// and adjust position before showing
		offset = $.datepicker._checkOffset(inst, offset, isFixed);
		inst.dpDiv.css({position: ($.datepicker._inDialog && $.blockUI ?
			"static" : (isFixed ? "fixed" : "absolute")), display: "none",
			left: offset.left + "px", top: offset.top + "px"});

		if (!inst.inline) {
			showAnim = $.datepicker._get(inst, "showAnim");
			duration = $.datepicker._get(inst, "duration");
			inst.dpDiv.css( "z-index", datepicker_getZindex( $( input ) ) + 1 );
			$.datepicker._datepickerShowing = true;

			if ( $.effects && $.effects.effect[ showAnim ] ) {
				inst.dpDiv.show(showAnim, $.datepicker._get(inst, "showOptions"), duration);
			} else {
				inst.dpDiv[showAnim || "show"](showAnim ? duration : null);
			}

			if ( $.datepicker._shouldFocusInput( inst ) ) {
				inst.input.focus();
			}

			$.datepicker._curInst = inst;
		}
	},

	/* Generate the date picker content. */
	_updateDatepicker: function(inst) {
		this.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
		datepicker_instActive = inst; // for delegate hover events
		inst.dpDiv.empty().append(this._generateHTML(inst));
		this._attachHandlers(inst);

		var origyearshtml,
			numMonths = this._getNumberOfMonths(inst),
			cols = numMonths[1],
			width = 17,
			activeCell = inst.dpDiv.find( "." + this._dayOverClass + " a" );

		if ( activeCell.length > 0 ) {
			datepicker_handleMouseover.apply( activeCell.get( 0 ) );
		}

		inst.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");
		if (cols > 1) {
			inst.dpDiv.addClass("ui-datepicker-multi-" + cols).css("width", (width * cols) + "em");
		}
		inst.dpDiv[(numMonths[0] !== 1 || numMonths[1] !== 1 ? "add" : "remove") +
			"Class"]("ui-datepicker-multi");
		inst.dpDiv[(this._get(inst, "isRTL") ? "add" : "remove") +
			"Class"]("ui-datepicker-rtl");

		if (inst === $.datepicker._curInst && $.datepicker._datepickerShowing && $.datepicker._shouldFocusInput( inst ) ) {
			inst.input.focus();
		}

		// deffered render of the years select (to avoid flashes on Firefox)
		if( inst.yearshtml ){
			origyearshtml = inst.yearshtml;
			setTimeout(function(){
				//assure that inst.yearshtml didn't change.
				if( origyearshtml === inst.yearshtml && inst.yearshtml ){
					inst.dpDiv.find("select.ui-datepicker-year:first").replaceWith(inst.yearshtml);
				}
				origyearshtml = inst.yearshtml = null;
			}, 0);
		}
	},

	// #6694 - don't focus the input if it's already focused
	// this breaks the change event in IE
	// Support: IE and jQuery <1.9
	_shouldFocusInput: function( inst ) {
		return inst.input && inst.input.is( ":visible" ) && !inst.input.is( ":disabled" ) && !inst.input.is( ":focus" );
	},

	/* Check positioning to remain on screen. */
	_checkOffset: function(inst, offset, isFixed) {
		var dpWidth = inst.dpDiv.outerWidth(),
			dpHeight = inst.dpDiv.outerHeight(),
			inputWidth = inst.input ? inst.input.outerWidth() : 0,
			inputHeight = inst.input ? inst.input.outerHeight() : 0,
			viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : $(document).scrollLeft()),
			viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : $(document).scrollTop());

		offset.left -= (this._get(inst, "isRTL") ? (dpWidth - inputWidth) : 0);
		offset.left -= (isFixed && offset.left === inst.input.offset().left) ? $(document).scrollLeft() : 0;
		offset.top -= (isFixed && offset.top === (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

		// now check if datepicker is showing outside window viewport - move to a better place if so.
		offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
			Math.abs(offset.left + dpWidth - viewWidth) : 0);
		offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
			Math.abs(dpHeight + inputHeight) : 0);

		return offset;
	},

	/* Find an object's position on the screen. */
	_findPos: function(obj) {
		var position,
			inst = this._getInst(obj),
			isRTL = this._get(inst, "isRTL");

		while (obj && (obj.type === "hidden" || obj.nodeType !== 1 || $.expr.filters.hidden(obj))) {
			obj = obj[isRTL ? "previousSibling" : "nextSibling"];
		}

		position = $(obj).offset();
		return [position.left, position.top];
	},

	/* Hide the date picker from view.
	 * @param  input  element - the input field attached to the date picker
	 */
	_hideDatepicker: function(input) {
		var showAnim, duration, postProcess, onClose,
			inst = this._curInst;

		if (!inst || (input && inst !== $.data(input, "datepicker"))) {
			return;
		}

		if (this._datepickerShowing) {
			showAnim = this._get(inst, "showAnim");
			duration = this._get(inst, "duration");
			postProcess = function() {
				$.datepicker._tidyDialog(inst);
			};

			// DEPRECATED: after BC for 1.8.x $.effects[ showAnim ] is not needed
			if ( $.effects && ( $.effects.effect[ showAnim ] || $.effects[ showAnim ] ) ) {
				inst.dpDiv.hide(showAnim, $.datepicker._get(inst, "showOptions"), duration, postProcess);
			} else {
				inst.dpDiv[(showAnim === "slideDown" ? "slideUp" :
					(showAnim === "fadeIn" ? "fadeOut" : "hide"))]((showAnim ? duration : null), postProcess);
			}

			if (!showAnim) {
				postProcess();
			}
			this._datepickerShowing = false;

			onClose = this._get(inst, "onClose");
			if (onClose) {
				onClose.apply((inst.input ? inst.input[0] : null), [(inst.input ? inst.input.val() : ""), inst]);
			}

			this._lastInput = null;
			if (this._inDialog) {
				this._dialogInput.css({ position: "absolute", left: "0", top: "-100px" });
				if ($.blockUI) {
					$.unblockUI();
					$("body").append(this.dpDiv);
				}
			}
			this._inDialog = false;
		}
	},

	/* Tidy up after a dialog display. */
	_tidyDialog: function(inst) {
		inst.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar");
	},

	/* Close date picker if clicked elsewhere. */
	_checkExternalClick: function(event) {
		if (!$.datepicker._curInst) {
			return;
		}

		var $target = $(event.target),
			inst = $.datepicker._getInst($target[0]);

		if ( ( ( $target[0].id !== $.datepicker._mainDivId &&
				$target.parents("#" + $.datepicker._mainDivId).length === 0 &&
				!$target.hasClass($.datepicker.markerClassName) &&
				!$target.closest("." + $.datepicker._triggerClass).length &&
				$.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI) ) ) ||
			( $target.hasClass($.datepicker.markerClassName) && $.datepicker._curInst !== inst ) ) {
				$.datepicker._hideDatepicker();
		}
	},

	/* Adjust one of the date sub-fields. */
	_adjustDate: function(id, offset, period) {
		var target = $(id),
			inst = this._getInst(target[0]);

		if (this._isDisabledDatepicker(target[0])) {
			return;
		}
		this._adjustInstDate(inst, offset +
			(period === "M" ? this._get(inst, "showCurrentAtPos") : 0), // undo positioning
			period);
		this._updateDatepicker(inst);
	},

	/* Action for current link. */
	_gotoToday: function(id) {
		var date,
			target = $(id),
			inst = this._getInst(target[0]);

		if (this._get(inst, "gotoCurrent") && inst.currentDay) {
			inst.selectedDay = inst.currentDay;
			inst.drawMonth = inst.selectedMonth = inst.currentMonth;
			inst.drawYear = inst.selectedYear = inst.currentYear;
		} else {
			date = new Date();
			inst.selectedDay = date.getDate();
			inst.drawMonth = inst.selectedMonth = date.getMonth();
			inst.drawYear = inst.selectedYear = date.getFullYear();
		}
		this._notifyChange(inst);
		this._adjustDate(target);
	},

	/* Action for selecting a new month/year. */
	_selectMonthYear: function(id, select, period) {
		var target = $(id),
			inst = this._getInst(target[0]);

		inst["selected" + (period === "M" ? "Month" : "Year")] =
		inst["draw" + (period === "M" ? "Month" : "Year")] =
			parseInt(select.options[select.selectedIndex].value,10);

		this._notifyChange(inst);
		this._adjustDate(target);
	},

	/* Action for selecting a day. */
	_selectDay: function(id, month, year, td) {
		var inst,
			target = $(id);

		if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
			return;
		}

		inst = this._getInst(target[0]);
		inst.selectedDay = inst.currentDay = $("a", td).html();
		inst.selectedMonth = inst.currentMonth = month;
		inst.selectedYear = inst.currentYear = year;
		this._selectDate(id, this._formatDate(inst,
			inst.currentDay, inst.currentMonth, inst.currentYear));
	},

	/* Erase the input field and hide the date picker. */
	_clearDate: function(id) {
		var target = $(id);
		this._selectDate(target, "");
	},

	/* Update the input field with the selected date. */
	_selectDate: function(id, dateStr) {
		var onSelect,
			target = $(id),
			inst = this._getInst(target[0]);

		dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
		if (inst.input) {
			inst.input.val(dateStr);
		}
		this._updateAlternate(inst);

		onSelect = this._get(inst, "onSelect");
		if (onSelect) {
			onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);  // trigger custom callback
		} else if (inst.input) {
			inst.input.trigger("change"); // fire the change event
		}

		if (inst.inline){
			this._updateDatepicker(inst);
		} else {
			this._hideDatepicker();
			this._lastInput = inst.input[0];
			if (typeof(inst.input[0]) !== "object") {
				inst.input.focus(); // restore focus
			}
			this._lastInput = null;
		}
	},

	/* Update any alternate field to synchronise with the main field. */
	_updateAlternate: function(inst) {
		var altFormat, date, dateStr,
			altField = this._get(inst, "altField");

		if (altField) { // update alternate field too
			altFormat = this._get(inst, "altFormat") || this._get(inst, "dateFormat");
			date = this._getDate(inst);
			dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
			$(altField).each(function() { $(this).val(dateStr); });
		}
	},

	/* Set as beforeShowDay function to prevent selection of weekends.
	 * @param  date  Date - the date to customise
	 * @return [boolean, string] - is this date selectable?, what is its CSS class?
	 */
	noWeekends: function(date) {
		var day = date.getDay();
		return [(day > 0 && day < 6), ""];
	},

	/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	 * @param  date  Date - the date to get the week for
	 * @return  number - the number of the week within the year that contains this date
	 */
	iso8601Week: function(date) {
		var time,
			checkDate = new Date(date.getTime());

		// Find Thursday of this week starting on Monday
		checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

		time = checkDate.getTime();
		checkDate.setMonth(0); // Compare with Jan 1
		checkDate.setDate(1);
		return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
	},

	/* Parse a string value into a date object.
	 * See formatDate below for the possible formats.
	 *
	 * @param  format string - the expected format of the date
	 * @param  value string - the date in the above format
	 * @param  settings Object - attributes include:
	 *					shortYearCutoff  number - the cutoff year for determining the century (optional)
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  Date - the extracted date value or null if value is blank
	 */
	parseDate: function (format, value, settings) {
		if (format == null || value == null) {
			throw "Invalid arguments";
		}

		value = (typeof value === "object" ? value.toString() : value + "");
		if (value === "") {
			return null;
		}

		var iFormat, dim, extra,
			iValue = 0,
			shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff,
			shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
				new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
			dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
			dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
			monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
			monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
			year = -1,
			month = -1,
			day = -1,
			doy = -1,
			literal = false,
			date,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			},
			// Extract a number from the string value
			getNumber = function(match) {
				var isDoubled = lookAhead(match),
					size = (match === "@" ? 14 : (match === "!" ? 20 :
					(match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
					minSize = (match === "y" ? size : 1),
					digits = new RegExp("^\\d{" + minSize + "," + size + "}"),
					num = value.substring(iValue).match(digits);
				if (!num) {
					throw "Missing number at position " + iValue;
				}
				iValue += num[0].length;
				return parseInt(num[0], 10);
			},
			// Extract a name from the string value and convert to an index
			getName = function(match, shortNames, longNames) {
				var index = -1,
					names = $.map(lookAhead(match) ? longNames : shortNames, function (v, k) {
						return [ [k, v] ];
					}).sort(function (a, b) {
						return -(a[1].length - b[1].length);
					});

				$.each(names, function (i, pair) {
					var name = pair[1];
					if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
						index = pair[0];
						iValue += name.length;
						return false;
					}
				});
				if (index !== -1) {
					return index + 1;
				} else {
					throw "Unknown name at position " + iValue;
				}
			},
			// Confirm that a literal character matches the string value
			checkLiteral = function() {
				if (value.charAt(iValue) !== format.charAt(iFormat)) {
					throw "Unexpected literal at position " + iValue;
				}
				iValue++;
			};

		for (iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
					literal = false;
				} else {
					checkLiteral();
				}
			} else {
				switch (format.charAt(iFormat)) {
					case "d":
						day = getNumber("d");
						break;
					case "D":
						getName("D", dayNamesShort, dayNames);
						break;
					case "o":
						doy = getNumber("o");
						break;
					case "m":
						month = getNumber("m");
						break;
					case "M":
						month = getName("M", monthNamesShort, monthNames);
						break;
					case "y":
						year = getNumber("y");
						break;
					case "@":
						date = new Date(getNumber("@"));
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "!":
						date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "'":
						if (lookAhead("'")){
							checkLiteral();
						} else {
							literal = true;
						}
						break;
					default:
						checkLiteral();
				}
			}
		}

		if (iValue < value.length){
			extra = value.substr(iValue);
			if (!/^\s+/.test(extra)) {
				throw "Extra/unparsed characters found in date: " + extra;
			}
		}

		if (year === -1) {
			year = new Date().getFullYear();
		} else if (year < 100) {
			year += new Date().getFullYear() - new Date().getFullYear() % 100 +
				(year <= shortYearCutoff ? 0 : -100);
		}

		if (doy > -1) {
			month = 1;
			day = doy;
			do {
				dim = this._getDaysInMonth(year, month - 1);
				if (day <= dim) {
					break;
				}
				month++;
				day -= dim;
			} while (true);
		}

		date = this._daylightSavingAdjust(new Date(year, month - 1, day));
		if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
			throw "Invalid date"; // E.g. 31/02/00
		}
		return date;
	},

	/* Standard date formats. */
	ATOM: "yy-mm-dd", // RFC 3339 (ISO 8601)
	COOKIE: "D, dd M yy",
	ISO_8601: "yy-mm-dd",
	RFC_822: "D, d M y",
	RFC_850: "DD, dd-M-y",
	RFC_1036: "D, d M y",
	RFC_1123: "D, d M yy",
	RFC_2822: "D, d M yy",
	RSS: "D, d M y", // RFC 822
	TICKS: "!",
	TIMESTAMP: "@",
	W3C: "yy-mm-dd", // ISO 8601

	_ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
		Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

	/* Format a date object into a string value.
	 * The format can be combinations of the following:
	 * d  - day of month (no leading zero)
	 * dd - day of month (two digit)
	 * o  - day of year (no leading zeros)
	 * oo - day of year (three digit)
	 * D  - day name short
	 * DD - day name long
	 * m  - month of year (no leading zero)
	 * mm - month of year (two digit)
	 * M  - month name short
	 * MM - month name long
	 * y  - year (two digit)
	 * yy - year (four digit)
	 * @ - Unix timestamp (ms since 01/01/1970)
	 * ! - Windows ticks (100ns since 01/01/0001)
	 * "..." - literal text
	 * '' - single quote
	 *
	 * @param  format string - the desired format of the date
	 * @param  date Date - the date value to format
	 * @param  settings Object - attributes include:
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  string - the date in the above format
	 */
	formatDate: function (format, date, settings) {
		if (!date) {
			return "";
		}

		var iFormat,
			dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
			dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
			monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
			monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			},
			// Format a number, with leading zero if necessary
			formatNumber = function(match, value, len) {
				var num = "" + value;
				if (lookAhead(match)) {
					while (num.length < len) {
						num = "0" + num;
					}
				}
				return num;
			},
			// Format a name, short or long as requested
			formatName = function(match, value, shortNames, longNames) {
				return (lookAhead(match) ? longNames[value] : shortNames[value]);
			},
			output = "",
			literal = false;

		if (date) {
			for (iFormat = 0; iFormat < format.length; iFormat++) {
				if (literal) {
					if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
						literal = false;
					} else {
						output += format.charAt(iFormat);
					}
				} else {
					switch (format.charAt(iFormat)) {
						case "d":
							output += formatNumber("d", date.getDate(), 2);
							break;
						case "D":
							output += formatName("D", date.getDay(), dayNamesShort, dayNames);
							break;
						case "o":
							output += formatNumber("o",
								Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
							break;
						case "m":
							output += formatNumber("m", date.getMonth() + 1, 2);
							break;
						case "M":
							output += formatName("M", date.getMonth(), monthNamesShort, monthNames);
							break;
						case "y":
							output += (lookAhead("y") ? date.getFullYear() :
								(date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
							break;
						case "@":
							output += date.getTime();
							break;
						case "!":
							output += date.getTime() * 10000 + this._ticksTo1970;
							break;
						case "'":
							if (lookAhead("'")) {
								output += "'";
							} else {
								literal = true;
							}
							break;
						default:
							output += format.charAt(iFormat);
					}
				}
			}
		}
		return output;
	},

	/* Extract all possible characters from the date format. */
	_possibleChars: function (format) {
		var iFormat,
			chars = "",
			literal = false,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			};

		for (iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
					literal = false;
				} else {
					chars += format.charAt(iFormat);
				}
			} else {
				switch (format.charAt(iFormat)) {
					case "d": case "m": case "y": case "@":
						chars += "0123456789";
						break;
					case "D": case "M":
						return null; // Accept anything
					case "'":
						if (lookAhead("'")) {
							chars += "'";
						} else {
							literal = true;
						}
						break;
					default:
						chars += format.charAt(iFormat);
				}
			}
		}
		return chars;
	},

	/* Get a setting value, defaulting if necessary. */
	_get: function(inst, name) {
		return inst.settings[name] !== undefined ?
			inst.settings[name] : this._defaults[name];
	},

	/* Parse existing date and initialise date picker. */
	_setDateFromField: function(inst, noDefault) {
		if (inst.input.val() === inst.lastVal) {
			return;
		}

		var dateFormat = this._get(inst, "dateFormat"),
			dates = inst.lastVal = inst.input ? inst.input.val() : null,
			defaultDate = this._getDefaultDate(inst),
			date = defaultDate,
			settings = this._getFormatConfig(inst);

		try {
			date = this.parseDate(dateFormat, dates, settings) || defaultDate;
		} catch (event) {
			dates = (noDefault ? "" : dates);
		}
		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		inst.currentDay = (dates ? date.getDate() : 0);
		inst.currentMonth = (dates ? date.getMonth() : 0);
		inst.currentYear = (dates ? date.getFullYear() : 0);
		this._adjustInstDate(inst);
	},

	/* Retrieve the default date shown on opening. */
	_getDefaultDate: function(inst) {
		return this._restrictMinMax(inst,
			this._determineDate(inst, this._get(inst, "defaultDate"), new Date()));
	},

	/* A date may be specified as an exact value or a relative one. */
	_determineDate: function(inst, date, defaultDate) {
		var offsetNumeric = function(offset) {
				var date = new Date();
				date.setDate(date.getDate() + offset);
				return date;
			},
			offsetString = function(offset) {
				try {
					return $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"),
						offset, $.datepicker._getFormatConfig(inst));
				}
				catch (e) {
					// Ignore
				}

				var date = (offset.toLowerCase().match(/^c/) ?
					$.datepicker._getDate(inst) : null) || new Date(),
					year = date.getFullYear(),
					month = date.getMonth(),
					day = date.getDate(),
					pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
					matches = pattern.exec(offset);

				while (matches) {
					switch (matches[2] || "d") {
						case "d" : case "D" :
							day += parseInt(matches[1],10); break;
						case "w" : case "W" :
							day += parseInt(matches[1],10) * 7; break;
						case "m" : case "M" :
							month += parseInt(matches[1],10);
							day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
							break;
						case "y": case "Y" :
							year += parseInt(matches[1],10);
							day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
							break;
					}
					matches = pattern.exec(offset);
				}
				return new Date(year, month, day);
			},
			newDate = (date == null || date === "" ? defaultDate : (typeof date === "string" ? offsetString(date) :
				(typeof date === "number" ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : new Date(date.getTime()))));

		newDate = (newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate);
		if (newDate) {
			newDate.setHours(0);
			newDate.setMinutes(0);
			newDate.setSeconds(0);
			newDate.setMilliseconds(0);
		}
		return this._daylightSavingAdjust(newDate);
	},

	/* Handle switch to/from daylight saving.
	 * Hours may be non-zero on daylight saving cut-over:
	 * > 12 when midnight changeover, but then cannot generate
	 * midnight datetime, so jump to 1AM, otherwise reset.
	 * @param  date  (Date) the date to check
	 * @return  (Date) the corrected date
	 */
	_daylightSavingAdjust: function(date) {
		if (!date) {
			return null;
		}
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},

	/* Set the date(s) directly. */
	_setDate: function(inst, date, noChange) {
		var clear = !date,
			origMonth = inst.selectedMonth,
			origYear = inst.selectedYear,
			newDate = this._restrictMinMax(inst, this._determineDate(inst, date, new Date()));

		inst.selectedDay = inst.currentDay = newDate.getDate();
		inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
		inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
		if ((origMonth !== inst.selectedMonth || origYear !== inst.selectedYear) && !noChange) {
			this._notifyChange(inst);
		}
		this._adjustInstDate(inst);
		if (inst.input) {
			inst.input.val(clear ? "" : this._formatDate(inst));
		}
	},

	/* Retrieve the date(s) directly. */
	_getDate: function(inst) {
		var startDate = (!inst.currentYear || (inst.input && inst.input.val() === "") ? null :
			this._daylightSavingAdjust(new Date(
			inst.currentYear, inst.currentMonth, inst.currentDay)));
			return startDate;
	},

	/* Attach the onxxx handlers.  These are declared statically so
	 * they work with static code transformers like Caja.
	 */
	_attachHandlers: function(inst) {
		var stepMonths = this._get(inst, "stepMonths"),
			id = "#" + inst.id.replace( /\\\\/g, "\\" );
		inst.dpDiv.find("[data-handler]").map(function () {
			var handler = {
				prev: function () {
					$.datepicker._adjustDate(id, -stepMonths, "M");
				},
				next: function () {
					$.datepicker._adjustDate(id, +stepMonths, "M");
				},
				hide: function () {
					$.datepicker._hideDatepicker();
				},
				today: function () {
					$.datepicker._gotoToday(id);
				},
				selectDay: function () {
					$.datepicker._selectDay(id, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this);
					return false;
				},
				selectMonth: function () {
					$.datepicker._selectMonthYear(id, this, "M");
					return false;
				},
				selectYear: function () {
					$.datepicker._selectMonthYear(id, this, "Y");
					return false;
				}
			};
			$(this).bind(this.getAttribute("data-event"), handler[this.getAttribute("data-handler")]);
		});
	},

	/* Generate the HTML for the current state of the date picker. */
	_generateHTML: function(inst) {
		var maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
			controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
			monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
			selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate,
			cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
			printDate, dRow, tbody, daySettings, otherMonth, unselectable,
			tempDate = new Date(),
			today = this._daylightSavingAdjust(
				new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())), // clear time
			isRTL = this._get(inst, "isRTL"),
			showButtonPanel = this._get(inst, "showButtonPanel"),
			hideIfNoPrevNext = this._get(inst, "hideIfNoPrevNext"),
			navigationAsDateFormat = this._get(inst, "navigationAsDateFormat"),
			numMonths = this._getNumberOfMonths(inst),
			showCurrentAtPos = this._get(inst, "showCurrentAtPos"),
			stepMonths = this._get(inst, "stepMonths"),
			isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
			currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
				new Date(inst.currentYear, inst.currentMonth, inst.currentDay))),
			minDate = this._getMinMaxDate(inst, "min"),
			maxDate = this._getMinMaxDate(inst, "max"),
			drawMonth = inst.drawMonth - showCurrentAtPos,
			drawYear = inst.drawYear;

		if (drawMonth < 0) {
			drawMonth += 12;
			drawYear--;
		}
		if (maxDate) {
			maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
				maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
			maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
			while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
				drawMonth--;
				if (drawMonth < 0) {
					drawMonth = 11;
					drawYear--;
				}
			}
		}
		inst.drawMonth = drawMonth;
		inst.drawYear = drawYear;

		prevText = this._get(inst, "prevText");
		prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
			this._getFormatConfig(inst)));

		prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
			"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
			" title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>" :
			(hideIfNoPrevNext ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+ prevText +"'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>"));

		nextText = this._get(inst, "nextText");
		nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
			this._getFormatConfig(inst)));

		next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
			"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
			" title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>" :
			(hideIfNoPrevNext ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+ nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>"));

		currentText = this._get(inst, "currentText");
		gotoDate = (this._get(inst, "gotoCurrent") && inst.currentDay ? currentDate : today);
		currentText = (!navigationAsDateFormat ? currentText :
			this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));

		controls = (!inst.inline ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
			this._get(inst, "closeText") + "</button>" : "");

		buttonPanel = (showButtonPanel) ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (isRTL ? controls : "") +
			(this._isInRange(inst, gotoDate) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" +
			">" + currentText + "</button>" : "") + (isRTL ? "" : controls) + "</div>" : "";

		firstDay = parseInt(this._get(inst, "firstDay"),10);
		firstDay = (isNaN(firstDay) ? 0 : firstDay);

		showWeek = this._get(inst, "showWeek");
		dayNames = this._get(inst, "dayNames");
		dayNamesMin = this._get(inst, "dayNamesMin");
		monthNames = this._get(inst, "monthNames");
		monthNamesShort = this._get(inst, "monthNamesShort");
		beforeShowDay = this._get(inst, "beforeShowDay");
		showOtherMonths = this._get(inst, "showOtherMonths");
		selectOtherMonths = this._get(inst, "selectOtherMonths");
		defaultDate = this._getDefaultDate(inst);
		html = "";
		dow;
		for (row = 0; row < numMonths[0]; row++) {
			group = "";
			this.maxRows = 4;
			for (col = 0; col < numMonths[1]; col++) {
				selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
				cornerClass = " ui-corner-all";
				calender = "";
				if (isMultiMonth) {
					calender += "<div class='ui-datepicker-group";
					if (numMonths[1] > 1) {
						switch (col) {
							case 0: calender += " ui-datepicker-group-first";
								cornerClass = " ui-corner-" + (isRTL ? "right" : "left"); break;
							case numMonths[1]-1: calender += " ui-datepicker-group-last";
								cornerClass = " ui-corner-" + (isRTL ? "left" : "right"); break;
							default: calender += " ui-datepicker-group-middle"; cornerClass = ""; break;
						}
					}
					calender += "'>";
				}
				calender += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + cornerClass + "'>" +
					(/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : "") +
					(/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : "") +
					this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
					row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
					"</div><table class='ui-datepicker-calendar'><thead>" +
					"<tr>";
				thead = (showWeek ? "<th class='ui-datepicker-week-col'>" + this._get(inst, "weekHeader") + "</th>" : "");
				for (dow = 0; dow < 7; dow++) { // days of the week
					day = (dow + firstDay) % 7;
					thead += "<th scope='col'" + ((dow + firstDay + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" +
						"<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
				}
				calender += thead + "</tr></thead><tbody>";
				daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
				if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
					inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
				}
				leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
				curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
				numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
				this.maxRows = numRows;
				printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
				for (dRow = 0; dRow < numRows; dRow++) { // create date picker rows
					calender += "<tr>";
					tbody = (!showWeek ? "" : "<td class='ui-datepicker-week-col'>" +
						this._get(inst, "calculateWeek")(printDate) + "</td>");
					for (dow = 0; dow < 7; dow++) { // create date picker days
						daySettings = (beforeShowDay ?
							beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, ""]);
						otherMonth = (printDate.getMonth() !== drawMonth);
						unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
							(minDate && printDate < minDate) || (maxDate && printDate > maxDate);
						tbody += "<td class='" +
							((dow + firstDay + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + // highlight weekends
							(otherMonth ? " ui-datepicker-other-month" : "") + // highlight days from other months
							((printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent) || // user pressed key
							(defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
							// or defaultDate is current printedDate and defaultDate is selectedDate
							" " + this._dayOverClass : "") + // highlight selected day
							(unselectable ? " " + this._unselectableClass + " ui-state-disabled": "") +  // highlight unselectable days
							(otherMonth && !showOtherMonths ? "" : " " + daySettings[1] + // highlight custom dates
							(printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "") + // highlight selected day
							(printDate.getTime() === today.getTime() ? " ui-datepicker-today" : "")) + "'" + // highlight today (if different)
							((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
							(unselectable ? "" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
							(otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
							(unselectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" : "<a class='ui-state-default" +
							(printDate.getTime() === today.getTime() ? " ui-state-highlight" : "") +
							(printDate.getTime() === currentDate.getTime() ? " ui-state-active" : "") + // highlight selected day
							(otherMonth ? " ui-priority-secondary" : "") + // distinguish dates from other months
							"' href='#'>" + printDate.getDate() + "</a>")) + "</td>"; // display selectable date
						printDate.setDate(printDate.getDate() + 1);
						printDate = this._daylightSavingAdjust(printDate);
					}
					calender += tbody + "</tr>";
				}
				drawMonth++;
				if (drawMonth > 11) {
					drawMonth = 0;
					drawYear++;
				}
				calender += "</tbody></table>" + (isMultiMonth ? "</div>" +
							((numMonths[0] > 0 && col === numMonths[1]-1) ? "<div class='ui-datepicker-row-break'></div>" : "") : "");
				group += calender;
			}
			html += group;
		}
		html += buttonPanel;
		inst._keyEvent = false;
		return html;
	},

	/* Generate the month and year header. */
	_generateMonthYearHeader: function(inst, drawMonth, drawYear, minDate, maxDate,
			secondary, monthNames, monthNamesShort) {

		var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear,
			changeMonth = this._get(inst, "changeMonth"),
			changeYear = this._get(inst, "changeYear"),
			showMonthAfterYear = this._get(inst, "showMonthAfterYear"),
			html = "<div class='ui-datepicker-title'>",
			monthHtml = "";

		// month selection
		if (secondary || !changeMonth) {
			monthHtml += "<span class='ui-datepicker-month'>" + monthNames[drawMonth] + "</span>";
		} else {
			inMinYear = (minDate && minDate.getFullYear() === drawYear);
			inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
			monthHtml += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>";
			for ( month = 0; month < 12; month++) {
				if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
					monthHtml += "<option value='" + month + "'" +
						(month === drawMonth ? " selected='selected'" : "") +
						">" + monthNamesShort[month] + "</option>";
				}
			}
			monthHtml += "</select>";
		}

		if (!showMonthAfterYear) {
			html += monthHtml + (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "");
		}

		// year selection
		if ( !inst.yearshtml ) {
			inst.yearshtml = "";
			if (secondary || !changeYear) {
				html += "<span class='ui-datepicker-year'>" + drawYear + "</span>";
			} else {
				// determine range of years to display
				years = this._get(inst, "yearRange").split(":");
				thisYear = new Date().getFullYear();
				determineYear = function(value) {
					var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) :
						(value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) :
						parseInt(value, 10)));
					return (isNaN(year) ? thisYear : year);
				};
				year = determineYear(years[0]);
				endYear = Math.max(year, determineYear(years[1] || ""));
				year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
				endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
				inst.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";
				for (; year <= endYear; year++) {
					inst.yearshtml += "<option value='" + year + "'" +
						(year === drawYear ? " selected='selected'" : "") +
						">" + year + "</option>";
				}
				inst.yearshtml += "</select>";

				html += inst.yearshtml;
				inst.yearshtml = null;
			}
		}

		html += this._get(inst, "yearSuffix");
		if (showMonthAfterYear) {
			html += (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "") + monthHtml;
		}
		html += "</div>"; // Close datepicker_header
		return html;
	},

	/* Adjust one of the date sub-fields. */
	_adjustInstDate: function(inst, offset, period) {
		var year = inst.drawYear + (period === "Y" ? offset : 0),
			month = inst.drawMonth + (period === "M" ? offset : 0),
			day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) + (period === "D" ? offset : 0),
			date = this._restrictMinMax(inst, this._daylightSavingAdjust(new Date(year, month, day)));

		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		if (period === "M" || period === "Y") {
			this._notifyChange(inst);
		}
	},

	/* Ensure a date is within any min/max bounds. */
	_restrictMinMax: function(inst, date) {
		var minDate = this._getMinMaxDate(inst, "min"),
			maxDate = this._getMinMaxDate(inst, "max"),
			newDate = (minDate && date < minDate ? minDate : date);
		return (maxDate && newDate > maxDate ? maxDate : newDate);
	},

	/* Notify change of month/year. */
	_notifyChange: function(inst) {
		var onChange = this._get(inst, "onChangeMonthYear");
		if (onChange) {
			onChange.apply((inst.input ? inst.input[0] : null),
				[inst.selectedYear, inst.selectedMonth + 1, inst]);
		}
	},

	/* Determine the number of months to show. */
	_getNumberOfMonths: function(inst) {
		var numMonths = this._get(inst, "numberOfMonths");
		return (numMonths == null ? [1, 1] : (typeof numMonths === "number" ? [1, numMonths] : numMonths));
	},

	/* Determine the current maximum date - ensure no time components are set. */
	_getMinMaxDate: function(inst, minMax) {
		return this._determineDate(inst, this._get(inst, minMax + "Date"), null);
	},

	/* Find the number of days in a given month. */
	_getDaysInMonth: function(year, month) {
		return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();
	},

	/* Find the day of the week of the first of a month. */
	_getFirstDayOfMonth: function(year, month) {
		return new Date(year, month, 1).getDay();
	},

	/* Determines if we should allow a "next/prev" month display change. */
	_canAdjustMonth: function(inst, offset, curYear, curMonth) {
		var numMonths = this._getNumberOfMonths(inst),
			date = this._daylightSavingAdjust(new Date(curYear,
			curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1));

		if (offset < 0) {
			date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
		}
		return this._isInRange(inst, date);
	},

	/* Is the given date in the accepted range? */
	_isInRange: function(inst, date) {
		var yearSplit, currentYear,
			minDate = this._getMinMaxDate(inst, "min"),
			maxDate = this._getMinMaxDate(inst, "max"),
			minYear = null,
			maxYear = null,
			years = this._get(inst, "yearRange");
			if (years){
				yearSplit = years.split(":");
				currentYear = new Date().getFullYear();
				minYear = parseInt(yearSplit[0], 10);
				maxYear = parseInt(yearSplit[1], 10);
				if ( yearSplit[0].match(/[+\-].*/) ) {
					minYear += currentYear;
				}
				if ( yearSplit[1].match(/[+\-].*/) ) {
					maxYear += currentYear;
				}
			}

		return ((!minDate || date.getTime() >= minDate.getTime()) &&
			(!maxDate || date.getTime() <= maxDate.getTime()) &&
			(!minYear || date.getFullYear() >= minYear) &&
			(!maxYear || date.getFullYear() <= maxYear));
	},

	/* Provide the configuration settings for formatting/parsing. */
	_getFormatConfig: function(inst) {
		var shortYearCutoff = this._get(inst, "shortYearCutoff");
		shortYearCutoff = (typeof shortYearCutoff !== "string" ? shortYearCutoff :
			new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
		return {shortYearCutoff: shortYearCutoff,
			dayNamesShort: this._get(inst, "dayNamesShort"), dayNames: this._get(inst, "dayNames"),
			monthNamesShort: this._get(inst, "monthNamesShort"), monthNames: this._get(inst, "monthNames")};
	},

	/* Format the given date for display. */
	_formatDate: function(inst, day, month, year) {
		if (!day) {
			inst.currentDay = inst.selectedDay;
			inst.currentMonth = inst.selectedMonth;
			inst.currentYear = inst.selectedYear;
		}
		var date = (day ? (typeof day === "object" ? day :
			this._daylightSavingAdjust(new Date(year, month, day))) :
			this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
		return this.formatDate(this._get(inst, "dateFormat"), date, this._getFormatConfig(inst));
	}
});

/*
 * Bind hover events for datepicker elements.
 * Done via delegate so the binding only occurs once in the lifetime of the parent div.
 * Global datepicker_instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
 */
function datepicker_bindHover(dpDiv) {
	var selector = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
	return dpDiv.delegate(selector, "mouseout", function() {
			$(this).removeClass("ui-state-hover");
			if (this.className.indexOf("ui-datepicker-prev") !== -1) {
				$(this).removeClass("ui-datepicker-prev-hover");
			}
			if (this.className.indexOf("ui-datepicker-next") !== -1) {
				$(this).removeClass("ui-datepicker-next-hover");
			}
		})
		.delegate( selector, "mouseover", datepicker_handleMouseover );
}

function datepicker_handleMouseover() {
	if (!$.datepicker._isDisabledDatepicker( datepicker_instActive.inline? datepicker_instActive.dpDiv.parent()[0] : datepicker_instActive.input[0])) {
		$(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");
		$(this).addClass("ui-state-hover");
		if (this.className.indexOf("ui-datepicker-prev") !== -1) {
			$(this).addClass("ui-datepicker-prev-hover");
		}
		if (this.className.indexOf("ui-datepicker-next") !== -1) {
			$(this).addClass("ui-datepicker-next-hover");
		}
	}
}

/* jQuery extend now ignores nulls! */
function datepicker_extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = props[name];
		}
	}
	return target;
}

/* Invoke the datepicker functionality.
   @param  options  string - a command, optionally followed by additional parameters or
					Object - settings for attaching new datepicker functionality
   @return  jQuery object */
$.fn.datepicker = function(options){

	/* Verify an empty collection wasn't passed - Fixes #6976 */
	if ( !this.length ) {
		return this;
	}

	/* Initialise the date picker. */
	if (!$.datepicker.initialized) {
		$(document).mousedown($.datepicker._checkExternalClick);
		$.datepicker.initialized = true;
	}

	/* Append datepicker main container to body if not exist. */
	if ($("#"+$.datepicker._mainDivId).length === 0) {
		$("body").append($.datepicker.dpDiv);
	}

	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (typeof options === "string" && (options === "isDisabled" || options === "getDate" || options === "widget")) {
		return $.datepicker["_" + options + "Datepicker"].
			apply($.datepicker, [this[0]].concat(otherArgs));
	}
	if (options === "option" && arguments.length === 2 && typeof arguments[1] === "string") {
		return $.datepicker["_" + options + "Datepicker"].
			apply($.datepicker, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		typeof options === "string" ?
			$.datepicker["_" + options + "Datepicker"].
				apply($.datepicker, [this].concat(otherArgs)) :
			$.datepicker._attachDatepicker(this, options);
	});
};

$.datepicker = new Datepicker(); // singleton instance
$.datepicker.initialized = false;
$.datepicker.uuid = new Date().getTime();
$.datepicker.version = "1.11.4";

var datepicker = $.datepicker;


/*!
 * jQuery UI Menu 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/menu/
 */


var menu = $.widget( "ui.menu", {
	version: "1.11.4",
	defaultElement: "<ul>",
	delay: 300,
	options: {
		icons: {
			submenu: "ui-icon-carat-1-e"
		},
		items: "> *",
		menus: "ul",
		position: {
			my: "left-1 top",
			at: "right top"
		},
		role: "menu",

		// callbacks
		blur: null,
		focus: null,
		select: null
	},

	_create: function() {
		this.activeMenu = this.element;

		// Flag used to prevent firing of the click handler
		// as the event bubbles up through nested menus
		this.mouseHandled = false;
		this.element
			.uniqueId()
			.addClass( "ui-menu ui-widget ui-widget-content" )
			.toggleClass( "ui-menu-icons", !!this.element.find( ".ui-icon" ).length )
			.attr({
				role: this.options.role,
				tabIndex: 0
			});

		if ( this.options.disabled ) {
			this.element
				.addClass( "ui-state-disabled" )
				.attr( "aria-disabled", "true" );
		}

		this._on({
			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .ui-menu-item": function( event ) {
				event.preventDefault();
			},
			"click .ui-menu-item": function( event ) {
				var target = $( event.target );
				if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
					this.select( event );

					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}

					// Open submenu on click
					if ( target.has( ".ui-menu" ).length ) {
						this.expand( event );
					} else if ( !this.element.is( ":focus" ) && $( this.document[ 0 ].activeElement ).closest( ".ui-menu" ).length ) {

						// Redirect focus to the menu
						this.element.trigger( "focus", [ true ] );

						// If the active item is on the top level, let it stay active.
						// Otherwise, blur the active item since it is no longer visible.
						if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
							clearTimeout( this.timer );
						}
					}
				}
			},
			"mouseenter .ui-menu-item": function( event ) {
				// Ignore mouse events while typeahead is active, see #10458.
				// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
				// is over an item in the menu
				if ( this.previousFilter ) {
					return;
				}
				var target = $( event.currentTarget );
				// Remove ui-state-active class from siblings of the newly focused menu item
				// to avoid a jump caused by adjacent elements both having a class with a border
				target.siblings( ".ui-state-active" ).removeClass( "ui-state-active" );
				this.focus( event, target );
			},
			mouseleave: "collapseAll",
			"mouseleave .ui-menu": "collapseAll",
			focus: function( event, keepActiveItem ) {
				// If there's already an active item, keep it active
				// If not, activate the first item
				var item = this.active || this.element.find( this.options.items ).eq( 0 );

				if ( !keepActiveItem ) {
					this.focus( event, item );
				}
			},
			blur: function( event ) {
				this._delay(function() {
					if ( !$.contains( this.element[0], this.document[0].activeElement ) ) {
						this.collapseAll( event );
					}
				});
			},
			keydown: "_keydown"
		});

		this.refresh();

		// Clicks outside of a menu collapse any open menus
		this._on( this.document, {
			click: function( event ) {
				if ( this._closeOnDocumentClick( event ) ) {
					this.collapseAll( event );
				}

				// Reset the mouseHandled flag
				this.mouseHandled = false;
			}
		});
	},

	_destroy: function() {
		// Destroy (sub)menus
		this.element
			.removeAttr( "aria-activedescendant" )
			.find( ".ui-menu" ).addBack()
				.removeClass( "ui-menu ui-widget ui-widget-content ui-menu-icons ui-front" )
				.removeAttr( "role" )
				.removeAttr( "tabIndex" )
				.removeAttr( "aria-labelledby" )
				.removeAttr( "aria-expanded" )
				.removeAttr( "aria-hidden" )
				.removeAttr( "aria-disabled" )
				.removeUniqueId()
				.show();

		// Destroy menu items
		this.element.find( ".ui-menu-item" )
			.removeClass( "ui-menu-item" )
			.removeAttr( "role" )
			.removeAttr( "aria-disabled" )
			.removeUniqueId()
			.removeClass( "ui-state-hover" )
			.removeAttr( "tabIndex" )
			.removeAttr( "role" )
			.removeAttr( "aria-haspopup" )
			.children().each( function() {
				var elem = $( this );
				if ( elem.data( "ui-menu-submenu-carat" ) ) {
					elem.remove();
				}
			});

		// Destroy menu dividers
		this.element.find( ".ui-menu-divider" ).removeClass( "ui-menu-divider ui-widget-content" );
	},

	_keydown: function( event ) {
		var match, prev, character, skip,
			preventDefault = true;

		switch ( event.keyCode ) {
		case $.ui.keyCode.PAGE_UP:
			this.previousPage( event );
			break;
		case $.ui.keyCode.PAGE_DOWN:
			this.nextPage( event );
			break;
		case $.ui.keyCode.HOME:
			this._move( "first", "first", event );
			break;
		case $.ui.keyCode.END:
			this._move( "last", "last", event );
			break;
		case $.ui.keyCode.UP:
			this.previous( event );
			break;
		case $.ui.keyCode.DOWN:
			this.next( event );
			break;
		case $.ui.keyCode.LEFT:
			this.collapse( event );
			break;
		case $.ui.keyCode.RIGHT:
			if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
				this.expand( event );
			}
			break;
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			this._activate( event );
			break;
		case $.ui.keyCode.ESCAPE:
			this.collapse( event );
			break;
		default:
			preventDefault = false;
			prev = this.previousFilter || "";
			character = String.fromCharCode( event.keyCode );
			skip = false;

			clearTimeout( this.filterTimer );

			if ( character === prev ) {
				skip = true;
			} else {
				character = prev + character;
			}

			match = this._filterMenuItems( character );
			match = skip && match.index( this.active.next() ) !== -1 ?
				this.active.nextAll( ".ui-menu-item" ) :
				match;

			// If no matches on the current filter, reset to the last character pressed
			// to move down the menu to the first item that starts with that character
			if ( !match.length ) {
				character = String.fromCharCode( event.keyCode );
				match = this._filterMenuItems( character );
			}

			if ( match.length ) {
				this.focus( event, match );
				this.previousFilter = character;
				this.filterTimer = this._delay(function() {
					delete this.previousFilter;
				}, 1000 );
			} else {
				delete this.previousFilter;
			}
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_activate: function( event ) {
		if ( !this.active.is( ".ui-state-disabled" ) ) {
			if ( this.active.is( "[aria-haspopup='true']" ) ) {
				this.expand( event );
			} else {
				this.select( event );
			}
		}
	},

	refresh: function() {
		var menus, items,
			that = this,
			icon = this.options.icons.submenu,
			submenus = this.element.find( this.options.menus );

		this.element.toggleClass( "ui-menu-icons", !!this.element.find( ".ui-icon" ).length );

		// Initialize nested menus
		submenus.filter( ":not(.ui-menu)" )
			.addClass( "ui-menu ui-widget ui-widget-content ui-front" )
			.hide()
			.attr({
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			})
			.each(function() {
				var menu = $( this ),
					item = menu.parent(),
					submenuCarat = $( "<span>" )
						.addClass( "ui-menu-icon ui-icon " + icon )
						.data( "ui-menu-submenu-carat", true );

				item
					.attr( "aria-haspopup", "true" )
					.prepend( submenuCarat );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			});

		menus = submenus.add( this.element );
		items = menus.find( this.options.items );

		// Initialize menu-items containing spaces and/or dashes only as dividers
		items.not( ".ui-menu-item" ).each(function() {
			var item = $( this );
			if ( that._isDivider( item ) ) {
				item.addClass( "ui-widget-content ui-menu-divider" );
			}
		});

		// Don't refresh list items that are already adapted
		items.not( ".ui-menu-item, .ui-menu-divider" )
			.addClass( "ui-menu-item" )
			.uniqueId()
			.attr({
				tabIndex: -1,
				role: this._itemRole()
			});

		// Add aria-disabled attribute to any disabled menu item
		items.filter( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

		// If the active item has been removed, blur the menu
		if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			this.blur();
		}
	},

	_itemRole: function() {
		return {
			menu: "menuitem",
			listbox: "option"
		}[ this.options.role ];
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			this.element.find( ".ui-menu-icon" )
				.removeClass( this.options.icons.submenu )
				.addClass( value.submenu );
		}
		if ( key === "disabled" ) {
			this.element
				.toggleClass( "ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
		}
		this._super( key, value );
	},

	focus: function( event, item ) {
		var nested, focused;
		this.blur( event, event && event.type === "focus" );

		this._scrollIntoView( item );

		this.active = item.first();
		focused = this.active.addClass( "ui-state-focus" ).removeClass( "ui-state-active" );
		// Only update aria-activedescendant if there's a role
		// otherwise we assume focus is managed elsewhere
		if ( this.options.role ) {
			this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
		}

		// Highlight active parent menu item, if any
		this.active
			.parent()
			.closest( ".ui-menu-item" )
			.addClass( "ui-state-active" );

		if ( event && event.type === "keydown" ) {
			this._close();
		} else {
			this.timer = this._delay(function() {
				this._close();
			}, this.delay );
		}

		nested = item.children( ".ui-menu" );
		if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
			this._startOpening(nested);
		}
		this.activeMenu = item.parent();

		this._trigger( "focus", event, { item: item } );
	},

	_scrollIntoView: function( item ) {
		var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
		if ( this._hasScroll() ) {
			borderTop = parseFloat( $.css( this.activeMenu[0], "borderTopWidth" ) ) || 0;
			paddingTop = parseFloat( $.css( this.activeMenu[0], "paddingTop" ) ) || 0;
			offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
			scroll = this.activeMenu.scrollTop();
			elementHeight = this.activeMenu.height();
			itemHeight = item.outerHeight();

			if ( offset < 0 ) {
				this.activeMenu.scrollTop( scroll + offset );
			} else if ( offset + itemHeight > elementHeight ) {
				this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
			}
		}
	},

	blur: function( event, fromFocus ) {
		if ( !fromFocus ) {
			clearTimeout( this.timer );
		}

		if ( !this.active ) {
			return;
		}

		this.active.removeClass( "ui-state-focus" );
		this.active = null;

		this._trigger( "blur", event, { item: this.active } );
	},

	_startOpening: function( submenu ) {
		clearTimeout( this.timer );

		// Don't open if already open fixes a Firefox bug that caused a .5 pixel
		// shift in the submenu position when mousing over the carat icon
		if ( submenu.attr( "aria-hidden" ) !== "true" ) {
			return;
		}

		this.timer = this._delay(function() {
			this._close();
			this._open( submenu );
		}, this.delay );
	},

	_open: function( submenu ) {
		var position = $.extend({
			of: this.active
		}, this.options.position );

		clearTimeout( this.timer );
		this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
			.hide()
			.attr( "aria-hidden", "true" );

		submenu
			.show()
			.removeAttr( "aria-hidden" )
			.attr( "aria-expanded", "true" )
			.position( position );
	},

	collapseAll: function( event, all ) {
		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			// If we were passed an event, look for the submenu that contains the event
			var currentMenu = all ? this.element :
				$( event && event.target ).closest( this.element.find( ".ui-menu" ) );

			// If we found no valid submenu ancestor, use the main menu to close all sub menus anyway
			if ( !currentMenu.length ) {
				currentMenu = this.element;
			}

			this._close( currentMenu );

			this.blur( event );
			this.activeMenu = currentMenu;
		}, this.delay );
	},

	// With no arguments, closes the currently active menu - if nothing is active
	// it closes all menus.  If passed an argument, it will search for menus BELOW
	_close: function( startMenu ) {
		if ( !startMenu ) {
			startMenu = this.active ? this.active.parent() : this.element;
		}

		startMenu
			.find( ".ui-menu" )
				.hide()
				.attr( "aria-hidden", "true" )
				.attr( "aria-expanded", "false" )
			.end()
			.find( ".ui-state-active" ).not( ".ui-state-focus" )
				.removeClass( "ui-state-active" );
	},

	_closeOnDocumentClick: function( event ) {
		return !$( event.target ).closest( ".ui-menu" ).length;
	},

	_isDivider: function( item ) {

		// Match hyphen, em dash, en dash
		return !/[^\-\u2014\u2013\s]/.test( item.text() );
	},

	collapse: function( event ) {
		var newItem = this.active &&
			this.active.parent().closest( ".ui-menu-item", this.element );
		if ( newItem && newItem.length ) {
			this._close();
			this.focus( event, newItem );
		}
	},

	expand: function( event ) {
		var newItem = this.active &&
			this.active
				.children( ".ui-menu " )
				.find( this.options.items )
				.first();

		if ( newItem && newItem.length ) {
			this._open( newItem.parent() );

			// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
			this._delay(function() {
				this.focus( event, newItem );
			});
		}
	},

	next: function( event ) {
		this._move( "next", "first", event );
	},

	previous: function( event ) {
		this._move( "prev", "last", event );
	},

	isFirstItem: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	isLastItem: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function( direction, filter, event ) {
		var next;
		if ( this.active ) {
			if ( direction === "first" || direction === "last" ) {
				next = this.active
					[ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
					.eq( -1 );
			} else {
				next = this.active
					[ direction + "All" ]( ".ui-menu-item" )
					.eq( 0 );
			}
		}
		if ( !next || !next.length || !this.active ) {
			next = this.activeMenu.find( this.options.items )[ filter ]();
		}

		this.focus( event, next );
	},

	nextPage: function( event ) {
		var item, base, height;

		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isLastItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.nextAll( ".ui-menu-item" ).each(function() {
				item = $( this );
				return item.offset().top - base - height < 0;
			});

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items )
				[ !this.active ? "first" : "last" ]() );
		}
	},

	previousPage: function( event ) {
		var item, base, height;
		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isFirstItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.prevAll( ".ui-menu-item" ).each(function() {
				item = $( this );
				return item.offset().top - base + height > 0;
			});

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items ).first() );
		}
	},

	_hasScroll: function() {
		return this.element.outerHeight() < this.element.prop( "scrollHeight" );
	},

	select: function( event ) {
		// TODO: It should never be possible to not have an active item at this
		// point, but the tests don't trigger mouseenter before click.
		this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
		var ui = { item: this.active };
		if ( !this.active.has( ".ui-menu" ).length ) {
			this.collapseAll( event, true );
		}
		this._trigger( "select", event, ui );
	},

	_filterMenuItems: function(character) {
		var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
			regex = new RegExp( "^" + escapedCharacter, "i" );

		return this.activeMenu
			.find( this.options.items )

			// Only match on items, not dividers or other content (#10571)
			.filter( ".ui-menu-item" )
			.filter(function() {
				return regex.test( $.trim( $( this ).text() ) );
			});
	}
});


/*!
 * jQuery UI Selectmenu 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/selectmenu
 */


var selectmenu = $.widget( "ui.selectmenu", {
    //edit by czf
    isLtIE8: (function () {
        var ua = window.navigator.userAgent.toLowerCase(),
            matchUa = ua.match(/msie([\s\S]+?);/);

        if ( matchUa != null && (matchUa[0].indexOf('7.0') != -1 || matchUa[0].indexOf('6.0') != -1) ) {
            return true;
        } else {
            return false;
        }
    })(),
    //edit by czf end
	version: "1.11.4",
	defaultElement: "<select>",
	options: {
		appendTo: null,
		disabled: null,
		icons: {
			button: "ui-icon-triangle-1-s"
		},
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		width: null,

		// callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		select: null
	},

	_create: function() {
		var selectmenuId = this.element.uniqueId().attr( "id" );
		this.ids = {
			element: selectmenuId,
			button: selectmenuId + "-button",
			menu: selectmenuId + "-menu"
		};

		this._drawButton();
		this._drawMenu();

		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_drawButton: function() {
		var that = this;

		// Associate existing label with the new button
		this.label = $( "label[for='" + this.ids.element + "']" ).attr( "for", this.ids.button );
		this._on( this.label, {
			click: function( event ) {
				this.button.focus();
				event.preventDefault();
			}
		});

		// Hide original select element
		this.element.hide();

		// Create button
		this.button = $( "<span>", {
			"class": "ui-selectmenu-button ui-widget ui-state-default ui-corner-all",
			tabindex: this.options.disabled ? -1 : 0,
			id: this.ids.button,
			role: "combobox",
			"aria-expanded": "false",
			//edit by czf "aria-autocomplete": "list",
			"aria-owns": this.ids.menu,
			"aria-haspopup": "true"
		})
			.insertAfter( this.element );

		$( "<span>", {
			"class": "ui-icon " + this.options.icons.button
		})
			.prependTo( this.button );

		this.buttonText = $( "<span>", {
			"class": "ui-selectmenu-text"
		})
			.appendTo( this.button );

		this._setText( this.buttonText, this.element.find( "option:selected" ).text() );
		this._resizeButton();

		this._on( this.button, this._buttonEvents );
		this.button.one( "focusin", function() {

			// Delay rendering the menu items until the button receives focus.
			// The menu may have already been rendered via a programmatic open.
			if ( !that.menuItems ) {
				that._refreshMenu();
			}
		});
		this._hoverable( this.button );
		this._focusable( this.button );
	},

	_drawMenu: function() {
		var that = this;

		// Create menu
		this.menu = $( "<ul>", {
			"aria-hidden": "true",
			"aria-labelledby": this.ids.button,
			id: this.ids.menu
		});

		// Wrap menu
		this.menuWrap = $( "<div>", {
			"class": "ui-selectmenu-menu ui-front"
		})
			.append( this.menu )
			.appendTo( this._appendTo() );

		// Initialize menu widget
		this.menuInstance = this.menu
			.menu({
				role: "listbox",
				select: function( event, ui ) {
					event.preventDefault();

					// support: IE8
					// If the item was selected via a click, the text selection
					// will be destroyed in IE
                    if (!that.isLtIE8) {
                        that._setSelection();
                    }

					that._select( ui.item.data( "ui-selectmenu-item" ), event );
				},
				focus: function( event, ui ) {
					var item = ui.item.data( "ui-selectmenu-item" );

					// Prevent inital focus from firing and check if its a newly focused item
					if ( that.focusIndex != null && item.index !== that.focusIndex ) {
						that._trigger( "focus", event, { item: item } );
						if ( !that.isOpen ) {
							that._select( item, event );
						}
					}
					that.focusIndex = item.index;

					that.button.attr( "aria-activedescendant",
						that.menuItems.eq( item.index ).attr( "id" ) );
				}
			})
			.menu( "instance" );

		// Adjust menu styles to dropdown
		this.menu
			.addClass( "ui-corner-bottom" )
			.removeClass( "ui-corner-all" );

		// Don't close the menu on mouseleave
		this.menuInstance._off( this.menu, "mouseleave" );

		// Cancel the menu's collapseAll on document click
		this.menuInstance._closeOnDocumentClick = function() {
			return false;
		};

		// Selects often contain empty items, but never contain dividers
		this.menuInstance._isDivider = function() {
			return false;
		};
	},

	refresh: function() {
		this._refreshMenu();
		this._setText( this.buttonText, this._getSelectedItem().text() );
		if ( !this.options.width ) {
			this._resizeButton();
		}
	},

	_refreshMenu: function() {
		this.menu.empty();

		var item,
			options = this.element.find( "option" );

		if ( !options.length ) {
			return;
		}

		this._parseOptions( options );
		this._renderMenu( this.menu, this.items );

		this.menuInstance.refresh();
		this.menuItems = this.menu.find( "li" ).not( ".ui-selectmenu-optgroup" );

		item = this._getSelectedItem();

		// Update the menu to have the correct item focused
		this.menuInstance.focus( null, item );
		this._setAria( item.data( "ui-selectmenu-item" ) );

		// Set disabled state
		this._setOption( "disabled", this.element.prop( "disabled" ) );
	},

	open: function( event ) {
		if ( this.options.disabled ) {
			return;
		}

		// If this is the first time the menu is being opened, render the items
		if ( !this.menuItems ) {
			this._refreshMenu();
		} else {

			// Menu clears focus on close, reset focus to selected item
			this.menu.find( ".ui-state-focus" ).removeClass( "ui-state-focus" );
			this.menuInstance.focus( null, this._getSelectedItem() );
		}

		this.isOpen = true;
		this._toggleAttr();
		this._resizeMenu();
		this._position();

		this._on( this.document, this._documentClick );

		this._trigger( "open", event );
	},

	_position: function() {
		this.menuWrap.position( $.extend( { of: this.button }, this.options.position ) );
	},

	close: function( event ) {
		if ( !this.isOpen ) {
			return;
		}

		this.isOpen = false;
		this._toggleAttr();

		this.range = null;
		this._off( this.document );

		this._trigger( "close", event );
	},

	widget: function() {
		return this.button;
	},

	menuWidget: function() {
		return this.menu;
	},

	_renderMenu: function( ul, items ) {
		var that = this,
			currentOptgroup = "";

		$.each( items, function( index, item ) {
			if ( item.optgroup !== currentOptgroup ) {
				$( "<li>", {
					"class": "ui-selectmenu-optgroup ui-menu-divider" +
						( item.element.parent( "optgroup" ).prop( "disabled" ) ?
							" ui-state-disabled" :
							"" ),
					text: item.optgroup
				})
					.appendTo( ul );

				currentOptgroup = item.optgroup;
			}

			that._renderItemData( ul, item );
		});
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-selectmenu-item", item );
	},

	_renderItem: function( ul, item ) {
		var li = $( "<li>" );

		if ( item.disabled ) {
			li.addClass( "ui-state-disabled" );
		}
		this._setText( li, item.label );

		return li.appendTo( ul );
	},

	_setText: function( element, value ) {
		if ( value ) {
			element.text( value );
		} else {
			element.html( "&#160;" );
		}
	},

	_move: function( direction, event ) {
		var item, next,
			filter = ".ui-menu-item";

		if ( this.isOpen ) {
			item = this.menuItems.eq( this.focusIndex );
		} else {
			item = this.menuItems.eq( this.element[ 0 ].selectedIndex );
			filter += ":not(.ui-state-disabled)";
		}

		if ( direction === "first" || direction === "last" ) {
			next = item[ direction === "first" ? "prevAll" : "nextAll" ]( filter ).eq( -1 );
		} else {
			next = item[ direction + "All" ]( filter ).eq( 0 );
		}

		if ( next.length ) {
			this.menuInstance.focus( event, next );
		}
	},

	_getSelectedItem: function() {
		return this.menuItems.eq( this.element[ 0 ].selectedIndex );
	},

	_toggle: function( event ) {
		this[ this.isOpen ? "close" : "open" ]( event );
	},

	_setSelection: function() {
		var selection;

		if ( !this.range ) {
			return;
		}

		if ( window.getSelection ) {
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange( this.range );

		// support: IE8
		} else {
			this.range.select();
		}

		// support: IE
		// Setting the text selection kills the button focus in IE, but
		// restoring the focus doesn't kill the selection.
		this.button.focus();
	},

	_documentClick: {
		mousedown: function( event ) {
			if ( !this.isOpen ) {
				return;
			}

			if ( !$( event.target ).closest( ".ui-selectmenu-menu, #" + this.ids.button ).length ) {
				this.close( event );
			}
		}
	},

	_buttonEvents: {

		// Prevent text selection from being reset when interacting with the selectmenu (#10144)
		mousedown: function() {
			var selection;

			if ( window.getSelection ) {
				selection = window.getSelection();
				if ( selection.rangeCount ) {
					this.range = selection.getRangeAt( 0 );
				}

			// support: IE8
			} else {
				this.range = document.selection.createRange();
			}
		},

		click: function( event ) {
            //edit by czf
            if (!this.isLtIE8) {
                this._setSelection();
            }
            //edit by czf end
			this._toggle( event );
		},

		keydown: function( event ) {
			var preventDefault = true;
			switch ( event.keyCode ) {
				case $.ui.keyCode.TAB:
				case $.ui.keyCode.ESCAPE:
					this.close( event );
					preventDefault = false;
					break;
				case $.ui.keyCode.ENTER:
					if ( this.isOpen ) {
						this._selectFocusedItem( event );
					}
					break;
				case $.ui.keyCode.UP:
					if ( event.altKey ) {
						this._toggle( event );
					} else {
						this._move( "prev", event );
					}
					break;
				case $.ui.keyCode.DOWN:
					if ( event.altKey ) {
						this._toggle( event );
					} else {
						this._move( "next", event );
					}
					break;
				case $.ui.keyCode.SPACE:
					if ( this.isOpen ) {
						this._selectFocusedItem( event );
					} else {
						this._toggle( event );
					}
					break;
				case $.ui.keyCode.LEFT:
					this._move( "prev", event );
					break;
				case $.ui.keyCode.RIGHT:
					this._move( "next", event );
					break;
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.PAGE_UP:
					this._move( "first", event );
					break;
				case $.ui.keyCode.END:
				case $.ui.keyCode.PAGE_DOWN:
					this._move( "last", event );
					break;
				default:
					this.menu.trigger( event );
					preventDefault = false;
			}

			if ( preventDefault ) {
				event.preventDefault();
			}
		}
	},

	_selectFocusedItem: function( event ) {
		var item = this.menuItems.eq( this.focusIndex );
		if ( !item.hasClass( "ui-state-disabled" ) ) {
			this._select( item.data( "ui-selectmenu-item" ), event );
		}
	},

	_select: function( item, event ) {
		var oldIndex = this.element[ 0 ].selectedIndex;

		// Change native select element
		this.element[ 0 ].selectedIndex = item.index;
		this._setText( this.buttonText, item.label );
		this._setAria( item );
		this._trigger( "select", event, { item: item } );

		if ( item.index !== oldIndex ) {
			this._trigger( "change", event, { item: item } );
		}

		this.close( event );
	},

	_setAria: function( item ) {
		var id = this.menuItems.eq( item.index ).attr( "id" );

		this.button.attr({
			"aria-labelledby": id,
			"aria-activedescendant": id
		});
		this.menu.attr( "aria-activedescendant", id );
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			this.button.find( "span.ui-icon" )
				.removeClass( this.options.icons.button )
				.addClass( value.button );
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.menuWrap.appendTo( this._appendTo() );
		}

		if ( key === "disabled" ) {
			this.menuInstance.option( "disabled", value );
			this.button
				.toggleClass( "ui-state-disabled", value )
				.attr( "aria-disabled", value );

			this.element.prop( "disabled", value );
			if ( value ) {
				this.button.attr( "tabindex", -1 );
				this.close();
			} else {
				this.button.attr( "tabindex", 0 );
			}
		}

		if ( key === "width" ) {
			this._resizeButton();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_toggleAttr: function() {
		this.button
			.toggleClass( "ui-corner-top", this.isOpen )
			.toggleClass( "ui-corner-all", !this.isOpen )
			.attr( "aria-expanded", this.isOpen );
		this.menuWrap.toggleClass( "ui-selectmenu-open", this.isOpen );
		this.menu.attr( "aria-hidden", !this.isOpen );
	},

	_resizeButton: function() {
		var width = this.options.width;

		if ( !width ) {
			width = this.element.show().outerWidth();
			this.element.hide();
		}

		this.button.outerWidth( width );
	},

	_resizeMenu: function() {
		this.menu.outerWidth( Math.max(
			this.button.outerWidth(),

			// support: IE10
			// IE10 wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping
			this.menu.width( "" ).outerWidth() + 1
		) );
	},

	_getCreateOptions: function() {
		return { disabled: this.element.prop( "disabled" ) };
	},

	_parseOptions: function( options ) {
		var data = [];
		options.each(function( index, item ) {
			var option = $( item ),
				optgroup = option.parent( "optgroup" );
			data.push({
				element: option,
				index: index,
				value: option.val(),
				label: option.text(),
				optgroup: optgroup.attr( "label" ) || "",
				disabled: optgroup.prop( "disabled" ) || option.prop( "disabled" )
			});
		});
		this.items = data;
	},

	_destroy: function() {
		this.menuWrap.remove();
		this.button.remove();
		this.element.show();
		this.element.removeUniqueId();
		this.label.attr( "for", this.ids.element );
	}
});




var slider = $.widget( "ui.slider", $.ui.mouse, {
	version: "1.11.4",
	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null,

		// callbacks
		change: null,
		slide: null,
		start: null,
		stop: null
	},

	// number of pages in a slider
	// (how many times can you page up/down to go through the whole range)
	numPages: 5,

	_create: function() {
		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();
		this._calculateNewMax();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all");

		this._refresh();
		this._setOption( "disabled", this.options.disabled );

		this._animateOff = false;
	},

	_refresh: function() {
		this._createRange();
		this._createHandles();
		this._setupEvents();
		this._refreshValue();
	},

	_createHandles: function() {
		var i, handleCount,
			options = this.options,
			existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
			handle = "<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",
			handles = [];

		handleCount = ( options.values && options.values.length ) || 1;

		if ( existingHandles.length > handleCount ) {
			existingHandles.slice( handleCount ).remove();
			existingHandles = existingHandles.slice( 0, handleCount );
		}

		for ( i = existingHandles.length; i < handleCount; i++ ) {
			handles.push( handle );
		}

		this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( this.element ) );

		this.handle = this.handles.eq( 0 );

		this.handles.each(function( i ) {
			$( this ).data( "ui-slider-handle-index", i );
		});
	},

	_createRange: function() {
		var options = this.options,
			classes = "";

		if ( options.range ) {
			if ( options.range === true ) {
				if ( !options.values ) {
					options.values = [ this._valueMin(), this._valueMin() ];
				} else if ( options.values.length && options.values.length !== 2 ) {
					options.values = [ options.values[0], options.values[0] ];
				} else if ( $.isArray( options.values ) ) {
					options.values = options.values.slice(0);
				}
			}

			if ( !this.range || !this.range.length ) {
				this.range = $( "<div></div>" )
					.appendTo( this.element );

				classes = "ui-slider-range" +
				// note: this isn't the most fittingly semantic framework class for this element,
				// but worked best visually with a variety of themes
				" ui-widget-header ui-corner-all";
			} else {
				this.range.removeClass( "ui-slider-range-min ui-slider-range-max" )
					// Handle range switching from true to min/max
					.css({
						"left": "",
						"bottom": ""
					});
			}

			this.range.addClass( classes +
				( ( options.range === "min" || options.range === "max" ) ? " ui-slider-range-" + options.range : "" ) );
		} else {
			if ( this.range ) {
				this.range.remove();
			}
			this.range = null;
		}
	},

	_setupEvents: function() {
		this._off( this.handles );
		this._on( this.handles, this._handleEvents );
		this._hoverable( this.handles );
		this._focusable( this.handles );
	},

	_destroy: function() {
		this.handles.remove();
		if ( this.range ) {
			this.range.remove();
		}

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );

		this._mouseDestroy();
	},

	_mouseCapture: function( event ) {
		var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle,
			that = this,
			o = this.options;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - that.values(i) );
			if (( distance > thisDistance ) ||
				( distance === thisDistance &&
					(i === that._lastChangedValue || that.values(i) === o.min ))) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		this._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();

		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().addBack().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		if ( !this.handles.hasClass( "ui-state-hover" ) ) {
			this._slide( event, index, normValue );
		}
		this._animateOff = true;
		return true;
	},

	_mouseStart: function() {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );

		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},

	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) &&
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			//store the last changed value index for reference when handles overlap
			this._lastChangedValue = index;

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
			return;
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
			return;
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( key === "range" && this.options.range === true ) {
			if ( value === "min" ) {
				this.options.value = this._values( 0 );
				this.options.values = null;
			} else if ( value === "max" ) {
				this.options.value = this._values( this.options.values.length - 1 );
				this.options.values = null;
			}
		}

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		if ( key === "disabled" ) {
			this.element.toggleClass( "ui-state-disabled", !!value );
		}

		this._super( key, value );

		switch ( key ) {
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();

				// Reset positioning from previous orientation
				this.handles.css( value === "horizontal" ? "bottom" : "left", "" );
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
			case "step":
			case "min":
			case "max":
				this._animateOff = true;
				this._calculateNewMax();
				this._refreshValue();
				this._animateOff = false;
				break;
			case "range":
				this._animateOff = true;
				this._refresh();
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else if ( this.options.values && this.options.values.length ) {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i += 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		} else {
			return [];
		}
	},

	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val <= this._valueMin() ) {
			return this._valueMin();
		}
		if ( val >= this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = (val - this._valueMin()) % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_calculateNewMax: function() {
		var max = this.options.max,
			min = this._valueMin(),
			step = this.options.step,
			aboveMin = Math.floor( ( +( max - min ).toFixed( this._precision() ) ) / step ) * step;
		max = aboveMin + min;
		this.max = parseFloat( max.toFixed( this._precision() ) );
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.max;
	},

	_refreshValue: function() {
		var lastValPercent, valPercent, value, valueMin, valueMax,
			oRange = this.options.range,
			o = this.options,
			that = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			_set = {};

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i ) {
				valPercent = ( that.values(i) - that._valueMin() ) / ( that._valueMax() - that._valueMin() ) * 100;
				_set[ that.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( that.options.range === true ) {
					if ( that.orientation === "horizontal" ) {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ this.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	},

	_handleEvents: {
		keydown: function( event ) {
			var allowed, curVal, newVal, step,
				index = $( event.target ).data( "ui-slider-handle-index" );

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.END:
				case $.ui.keyCode.PAGE_UP:
				case $.ui.keyCode.PAGE_DOWN:
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					event.preventDefault();
					if ( !this._keySliding ) {
						this._keySliding = true;
						$( event.target ).addClass( "ui-state-active" );
						allowed = this._start( event, index );
						if ( allowed === false ) {
							return;
						}
					}
					break;
			}

			step = this.options.step;
			if ( this.options.values && this.options.values.length ) {
				curVal = newVal = this.values( index );
			} else {
				curVal = newVal = this.value();
			}

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
					newVal = this._valueMin();
					break;
				case $.ui.keyCode.END:
					newVal = this._valueMax();
					break;
				case $.ui.keyCode.PAGE_UP:
					newVal = this._trimAlignValue(
						curVal + ( ( this._valueMax() - this._valueMin() ) / this.numPages )
					);
					break;
				case $.ui.keyCode.PAGE_DOWN:
					newVal = this._trimAlignValue(
						curVal - ( (this._valueMax() - this._valueMin()) / this.numPages ) );
					break;
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
					if ( curVal === this._valueMax() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal + step );
					break;
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					if ( curVal === this._valueMin() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal - step );
					break;
			}

			this._slide( event, index, newVal );
		},
		keyup: function( event ) {
			var index = $( event.target ).data( "ui-slider-handle-index" );

			if ( this._keySliding ) {
				this._keySliding = false;
				this._stop( event, index );
				this._change( event, index );
				$( event.target ).removeClass( "ui-state-active" );
			}
		}
	}
});



}));
