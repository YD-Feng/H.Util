'use strict';
(function(window, $){
    //实例
    var Monitor = require('./Util_modules/Monitor/Monitor');
    var Storage = require('./Util_modules/Storage/Storage');
    var Cookie = require('./Util_modules/Cookie/Cookie');
    var ItvEvents = require('./Util_modules/ItvEvents/ItvEvents');
    var Loader = require('./Util_modules/Loader/Loader');
    var Tooltips = require('./Util_modules/Tooltips/Tooltips');
    var Loading = require('./Util_modules/Loading/Loading');
    var Toast = require('./Util_modules/Toast/Toast');

    //类
    var Switchable = require('./Util_modules/Switchable/Switchable');
    var Pager = require('./Util_modules/Pager/Pager');
    var LazyDom = require('./Util_modules/LazyDom/LazyDom');

    //方法
    var Template = require('./Util_modules/Template/Template');
    var GetStrCodeLength = require('./Util_modules/GetStrCodeLength/GetStrCodeLength');
    var SubStrByCode = require('./Util_modules/SubStrByCode/SubStrByCode');
    var TransformParamsToJSON = require('./Util_modules/TransformParamsToJSON/TransformParamsToJSON');
    var ParsePrice = require('./Util_modules/ParsePrice/ParsePrice');

    //原生对象方法扩展
    var DateFormat = require('./Util_modules/DateFormat/DateFormat');

    //Jquery方法扩展
    var ValidationEngine = require('./Util_modules/ValidationEngine/ValidationEngine');
    var ValidationEngineLanguage = require('./Util_modules/ValidationEngine/ValidationEngineLanguageCN');

    window.H = window.H || {};

    //代理console.log
    H.log = function (msg) {
        if (typeof window['console'] != 'undefined') {
            try {
                window.console.log.call(window.console, '%c' + msg, 'font-size:14px; color:#C0A; font-family:微软雅黑; text-shadow:0px 1px 2px #ff0;');
            } catch (e) {
                window.console.log(msg);
            }
        }
    };

    //实例
    H.Monitor = new Monitor();
    H.Storage = new Storage();
    H.ItvEvents = new ItvEvents();
    H.Loader = new Loader();
    H.Tooltips = Tooltips;
    H.Cookie = Cookie;
    H.Loading = Loading;
    H.Toast = Toast;

    //类
    H.Switchable = Switchable;
    H.Pager = Pager;
    H.LazyDom = LazyDom;

    //方法
    H.template = Template;
    H.getStrCodeLength = GetStrCodeLength;
    H.subStrByCode = SubStrByCode;
    H.transformParamsToJSON = TransformParamsToJSON;
    H.parsePrice = ParsePrice;

    //原生对象方法扩展
    DateFormat();

    //Jquery方法扩展
    ValidationEngine($);
    ValidationEngineLanguage($);

    //H.log('欢迎使用 H 工具库，相关 API 可到 【https://github.com/YD-Feng/H.Util】 查看 readME 或 查看 demo');

})(window, jQuery);
