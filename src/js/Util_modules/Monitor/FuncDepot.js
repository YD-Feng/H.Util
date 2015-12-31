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