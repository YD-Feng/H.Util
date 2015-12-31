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