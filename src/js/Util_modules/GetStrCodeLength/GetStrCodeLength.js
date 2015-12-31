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
