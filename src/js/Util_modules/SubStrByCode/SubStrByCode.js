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
