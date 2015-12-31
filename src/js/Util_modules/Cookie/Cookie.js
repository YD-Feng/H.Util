'use strict';
var Cookie = {
    /*
     * 参数说明：
     * name 【String】 Cookie名
     * value 【String】 Cookie值
     * time 【Int】 过期时长（单位：毫秒）
     * */
    set: function (name, value, time) {
        var exp = new Date();
        exp.setTime(exp.getTime() + time);
        document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString();
    },

    /*
     * 参数说明：
     * name 【String】 Cookie名
     * */
    get: function (name) {
        var arr,
            reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    },

    /*
     * 参数说明：
     * name 【String】 Cookie名
     * */
    remove: function (name) {
        var exp = new Date(),
            cookieVal = this.get(name);

        exp.setTime(exp.getTime() - 1);

        if (cookieVal != null) {
            document.cookie = name + "=" + cookieVal + ";expires=" + exp.toGMTString();
        }
    }
};

module.exports = Cookie;
