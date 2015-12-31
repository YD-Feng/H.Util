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