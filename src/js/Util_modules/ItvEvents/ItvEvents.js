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

    $el.on(eventType + '.' + eventName, function () {
        _this.itvTrigger(eventName, fn, itvTime, this);
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