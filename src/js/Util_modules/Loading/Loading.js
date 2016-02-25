'use strict';
var Loading = {
    template: '<div id="J-h-loading" class="ui-loading"></div>',
    show: function () {
        var _this = this;
        $('body').append(_this.template);
    },
    hide: function () {
        $('#J-h-loading').remove();
    }
};

module.exports = Loading;
