'use strict';
(function(window, $){
    //实例
    var Monitor = require('./Util_modules/Monitor/Monitor');
    var Storage = require('./Util_modules/Storage/Storage');
    var Cookie = require('./Util_modules/Cookie/Cookie');
    var ItvEvents = require('./Util_modules/ItvEvents/ItvEvents');
    var JsLoader = require('./Util_modules/JsLoader/JsLoader');
    var Tooltips = require('./Util_modules/Tooltips/Tooltips');
    var Loading = require('./Util_modules/Loading/Loading');

    //类
    var Switchable = require('./Util_modules/Switchable/Switchable');
    var Pager = require('./Util_modules/Pager/Pager');
    var LazyDom = require('./Util_modules/LazyDom/LazyDom');

    //方法
    var Template = require('./Util_modules/Template/Template');
    var GetStrCodeLength = require('./Util_modules/GetStrCodeLength/GetStrCodeLength');
    var SubStrByCode = require('./Util_modules/SubStrByCode/SubStrByCode');
    var TransformParamsToJSON = require('./Util_modules/TransformParamsToJSON/TransformParamsToJSON');

    //原生对象方法扩展
    var DateFormat = require('./Util_modules/DateFormat/DateFormat');

    //Jquery方法扩展
    var ValidationEngine = require('./Util_modules/ValidationEngine/ValidationEngine');
    var ValidationEngineLanguage = require('./Util_modules/ValidationEngine/ValidationEngineLanguageCN');

    window.H = window.H || {};

    //代理console.log
    H.log = function(msg){
        if(window['console']){
            try{
                console.log.call(console, '%c' + msg, 'font-size:14px; color:#C0A; font-family:微软雅黑; text-shadow:0px 1px 2px #ff0;');
            }catch(e){
                console.log(msg);
            }
        }
    };

    //实例
    H.Monitor = new Monitor();
    H.Storage = new Storage();
    H.ItvEvents = new ItvEvents();
    H.JsLoader = new JsLoader();
    H.Tooltips = Tooltips;
    H.Cookie = Cookie;
    H.Loading = Loading;

    //类
    H.Switchable = Switchable;
    H.Pager = Pager;
    H.LazyDom = LazyDom;

    //方法
    H.template = Template;
    H.getStrCodeLength = GetStrCodeLength;
    H.subStrByCode = SubStrByCode;
    H.transformParamsToJSON = TransformParamsToJSON;

    //原生对象方法扩展
    DateFormat();

    //Jquery方法扩展
    ValidationEngine($);
    ValidationEngineLanguage($);

    $.ajaxSetup({
        beforeSend: function () {
            if (this.showLoadingMask) {
                H.Loading.show();
            }
        },
        complete: function () {
            if (this.showLoadingMask) {
                H.Loading.hide();
            }
        }
    })

})(window, jQuery);
