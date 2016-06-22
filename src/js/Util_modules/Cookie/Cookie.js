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
     * domain 【String】 Cookie域，可缺省，默认值为空字符串
     * path 【String】 Cookie路径，可缺省，默认值为 '/'
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
     * domain 【String】 Cookie域，可缺省，默认值为空字符串
     * path 【String】 Cookie路径，可缺省，默认值为 '/'
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
