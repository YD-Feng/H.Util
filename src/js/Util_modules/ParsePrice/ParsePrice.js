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
