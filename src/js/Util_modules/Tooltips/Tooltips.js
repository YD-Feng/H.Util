'use strict';
var tooltips = {};

/*
 * 提示框生成方法
 * */
tooltips.create = function (opts) {
    var options = {
        //需要添加提示框的目标元素 【JqueryObject】
        target: null,
        //提示框模版【string】
        tpl:　'<div class="J-tooltips ui-tooltips <%= themeCls %>" data-tooltips-create-flag="true">' +
                    '<div class="ui-tooltips-arrow">' +
                        '<i class="J-arrow arrow arrow-out">&#9670;</i>' +
                        '<i class="J-arrow arrow">&#9670;</i>' +
                    '</div>' +
                    '<div class="J-tooltips-content ui-tooltips-content"></div>' +
                '</div>',
        //提示框内容，类型可以是【string】或【function】，如果是【function】，要求该函数必须返回一个字符串
        content: '',
        //提示框主题【string】（默认值：''， 取值范围：''， 'info'， 'success'， 'warning'， 'error'）
        theme: '',
        //提示框展示在目标元素的哪一边【string】（取值范围：'top'， 'bottom'， 'left'， 'right'）
        side: 'top',
        //提示框的宽度【Int】（默认值：0， 默认情况下，宽度是自适应的，但是当 content 的内容是纯文本时，请务必设置 tooltips 宽度，否则可能会出现意想不到的意外结果出现）
        width: 0,
        //用来调整提示框的位置偏移【Object - Int】
        position: {
            top: 0,
            left: 0
        },
        //提示框显示标识
        showFlag: false,
        //提示框展示触发事件【string】（默认值:'mouseenter'）
        eventShow: 'mouseenter',
        //提示框隐藏触发事件【string】（默认值:'mouseleave'，当 eventShow 的值为 'click' 时，eventHide 会被强行无效化。改为点击提示框以外的区域触发隐藏）
        eventHide: 'mouseleave',
        //提示框显示后的回调【function】，有一个参数，传入的是生成的提示框的 JqueryObject
        onShow: null,
        //提示框隐藏后的回调【function】，有一个参数，传入的是生成的提示框的 JqueryObject
        onHide: null
    };

    //依赖template
    var template = require('../Template/Template');

    delete opts.tpl;
    delete opts.showFlag;

    $.extend(options, opts);

    if (options.target && options.target.length > 0) {
        options.target
            .append(template(options.tpl, {
                themeCls: options.theme == '' ? options.theme : 'ui-tooltips-' + options.theme
            }));

        var _width = options.width * 1;
        if (!isNaN(_width) && _width > 0) {
            options.target.find('div.J-tooltips-content').width(_width);
        }

        var targetPosition = options.target.css('position');
        if (targetPosition != 'relative' && targetPosition != 'absolute') {
            options.target.css('position', 'relative');
        }

        options.target.on(options.eventShow, function (e) {
            var $this = $(this),
                $target = $this.find('div.J-tooltips');

            if (!options.showFlag) {
                $target.find('div.J-tooltips-content').html(typeof options.content == 'function' ? options.content() : options.content);
                options.showFlag = true;
            }

            var $this_t = $this.offset().top,
                $this_l = $this.offset().left,
                $this_w = $this.outerWidth(),
                $this_h = $this.outerHeight(),
                $target_w = $target.outerWidth(),
                $target_h = $target.outerHeight(),
                window_w = $(window).width(),
                window_h = $(window).height(),
                scroll_t = $(document).scrollTop(),
                scroll_l = $(document).scrollLeft(),
                cssConfig = {},
                arrowCls = '',
                arrowCssConfig = {};

            if (options.side == 'left' || options.side == 'right') {

                if (options.side == 'left' && $target_w <= $this_l - scroll_l
                    || options.side == 'right' && $target_w > window_w - ($this_l - scroll_l) - $this_w
                ) {
                    arrowCls = 'right';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = ($target_w + 8) * (-1);
                } else {
                    arrowCls = 'left';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = $this_w + 8;
                }

                if (options.contSide && options.contSide == 'bottom' || options.contSide && options.contSide != 'bottom' && $target_h <= window_h - ($this_t - scroll_t)) {
                    arrowCls += '-top';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = 0;
                    arrowCssConfig['top'] = $this_h < $target_h ? $this_h / 2 : $target_h / 2;
                } else if (options.contSide && options.contSide == 'middle') {
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = ($target_h - $this_h) * (-0.5);
                } else {
                    arrowCls += '-bottom';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = ($target_h - $this_h) * (-1);
                    arrowCssConfig['top'] = $target_h - ($this_h < $target_h ? $this_h / 2 : $target_h / 2);
                }

            } else if (options.side == 'top' || options.side == 'bottom') {

                if ( (options.side == 'top' && $this_t - scroll_t < $target_h)
                    || options.side == 'bottom' && $target_h < window_h - ($this_t - scroll_t)
                ) {
                    arrowCls = 'top';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = $this_h + 5;
                } else {
                    arrowCls = 'bottom';
                    cssConfig['top'] = 0 + options.position.top;
                    cssConfig['margin-top'] = ($target_h + 5) * (-1);
                }

                if (options.contSide && options.contSide == 'left' || options.contSide && options.contSide != 'right' && $target_w > window_w - ($this_l - scroll_l)) {
                    arrowCls += '-right';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = ($target_w - $this_w) * (-1);
                    arrowCssConfig['left'] = $target_w - ($this_w < $target_w ? $this_w / 2 : $target_w / 2);
                } else if (options.contSide && options.contSide == 'middle') {
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = ($target_w - $this_w) * (-0.5);
                } else {
                    arrowCls += '-left';
                    cssConfig['left'] = 0 + options.position.left;
                    cssConfig['margin-left'] = 0;
                    arrowCssConfig['left'] = $this_w < $target_w ? $this_w / 2 : $target_w / 2;
                }

            }

            $target
                .css(cssConfig)
                .addClass('ui-tooltips-' + arrowCls + '-arrow')
                .data('arrowCls', 'ui-tooltips-' + arrowCls + '-arrow')
                .addClass('z-ui-tooltips-in')
                .find('i.J-arrow')
                .css(arrowCssConfig);

            options.onShow && options.onShow($target);
        });

        if (options.eventShow != 'click') {
            options.target.on(options.eventHide, function () {
                var $target = $(this).find('div.J-tooltips');

                $target.addClass('z-ui-tooltips-out');

                setTimeout(function () {
                    $target.removeClass('z-ui-tooltips-in z-ui-tooltips-out' + ' ' + $target.data('arrowCls'));
                    options.showFlag = false;
                    options.onHide && options.onHide($target);
                }, 200);
            });
        } else {
            $(document).on('click', function (e) {
                if ($(e.target).closest(options.target).length == 0) {
                    var $target = options.target.find('div.J-tooltips');

                    $target.addClass('z-ui-tooltips-out');

                    setTimeout(function () {
                        $target.removeClass('z-ui-tooltips-in z-ui-tooltips-out' + ' ' + $target.data('arrowCls'));
                        options.showFlag = false;
                        options.onHide && options.onHide($target);
                    }, 200);
                }
            });
        }

        return options.target.find('div.J-tooltips');
    } else {
        return;
    }
};

/*
 * 提示框显示方法
 * */
tooltips.show = function ($target) {
    var flag = $target.data('tooltipsCreateFlag');
    if (typeof flag == 'undefined' || (flag && flag.toString() != 'true')) {
        $target.addClass('z-ui-tooltips-in');
    } else {
        console.log('通过 create 方法构造出来的 tooltips 不支持 show 方法。请通过触发事件的方式显示它。');
    }
};

/*
 * 提示框隐藏方法
 * */
tooltips.hide = function ($target) {
    $target.addClass('z-ui-tooltips-out');

    setTimeout(function () {
        $target.removeClass('z-ui-tooltips-in z-ui-tooltips-out' + ' ' + $target.data('arrowCls'));
    }, 200);
};

module.exports = tooltips;
