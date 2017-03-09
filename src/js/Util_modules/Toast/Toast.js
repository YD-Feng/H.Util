'use strict';
var Toast = {
    template: '<div id="J-h-toast" class="ui-toast"></div>',
    timeout: -1,
    show: function (msg, last) {
        var _this = this,
            $toast = $('#J-h-toast'),
            ml, mt;

        if ($toast.length == 0) {
            $toast = $(_this.template);
            $toast.appendTo('body');
        } else {
            _this.hide();
        }

        $toast.html(msg);

        ml = -1 * $toast.outerWidth() / 2;
        mt = -1 * $toast.outerHeight() / 2;

        $toast.css({
            marginLeft: ml,
            marginTop: mt
        }).show();

        _this.timeout = setTimeout(function () {
            _this.hide();
        }, (typeof last == 'undefined' ? 3000 : last));
    },
    hide: function () {
        clearTimeout(this.timeout);
        $('#J-h-toast').hide();
    }
};

module.exports = Toast;
