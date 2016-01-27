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
            paramsJSON[paramPair[0]] = paramPair[1];
        }
    }

    return paramsJSON;
};

module.exports = transformParamsToJSON;
