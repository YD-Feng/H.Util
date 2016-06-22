'use strict';

var template = require('../Template/Template');//PS:这里依赖了 Template 模块

/*
 * 构造方法
 *
 * 参数说明：
 * opts 【Obj】
 * opts 对象的子属性：
 * $target 【Jquery Dom Obj】 必传，绑定延迟加载触发滚动事件的目标对象，默认为 window，通常情况下不需要修改
 * method 【String】 加载方式，默认是 fromToBottom 从下方异步插入 dom 结构，传入可选值：fromToTop、fromToBottom
 * distanceToPageBottom 【Number】 每次触发延迟加载的滚动高度，默认是 200
 * isLazyLoad 【Boolean】 是否对延迟加载内容的图片做 lazyLoad 处理，默认为 true
 * allData 【Array】 延迟加载
 * preRender 【Integer】 预加载的屏数
 * renderCb 【Function】 延迟插入的 dom 结构渲染完成后执行的回调函数
 * */
var LazyDom = function (opts) {
    var _this = this;

    _this.options = {
        $target: $(window),
        method: 'fromToBottom',
        distanceToPageBottom: 200,
        isLazyLoad: true,
        allData: [],
        preRender: 0,
        renderCb: $.noop,
        finishEvent: $.noop,

        $doc: $(document), //document 的 Jquery 对象缓存
        oldTop: 0, //上一次触发延迟加载的滚动高度
        recTop: 0,
        targetH: 0,
        dataIndex: 0
    };

    $.extend(_this.options, opts);

    _this.getTargetH();
    _this.process();
    _this.bindEvent();
    _this.scroll();
    _this.chkBegin();

    return _this;
};

/*
* 获取触发异步加载滚动事件的目标对象的高度
* */
LazyDom.prototype.getTargetH = function () {
    var options = this.options;
    options.targetH = options.$target.height();
    return options.targetH;
};

/*
 * 数据处理，获得当次异步加载所需的渲染数据
 * */
LazyDom.prototype.process = function () {
    var options = this.options,
        allData = options.allData,
        curData = allData[options.dataIndex];

    if (curData) {
        curData.data = curData.data ? curData.data : [];
        curData.dataLen = curData.data.length;
        curData.rowCountPerScreen = Math.ceil(options.targetH / curData.listItemHeight); //每屏可显示的商品行数 = 触发元素高度 / 每个商品元素的高度
        curData.renderCb = curData.renderCb ? curData.renderCb : $.noop;
    }
};

/*
 * 数据处理，提取当次异步加载所需的渲染数据
 *
 * 参数说明：
 * screenCount 【Integer】 必传，要加载的屏数
 * */
LazyDom.prototype.extract = function (screenCount) {
    var _this = this,
        options = _this.options,
        curData = options.allData[options.dataIndex];

    if (curData && curData.type !== 'callback') {

        var startIndex = curData.startIndex ? curData.startIndex : 0, //开始下标
            endIndex = startIndex + curData.rowCountPerScreen * curData.goodsCountPerRow * screenCount, //结束下标 = 开始下标 + (每屏可加载的商品行数 * 每行的商品数 * 屏数)
            sliceData = curData.data.slice(startIndex, endIndex), //截取要加载的商品数据
            retData = {
                $node: curData.$node, //需要插入 dom 元素的节点对象【用户传入】
                listItemHeight: curData.listItemHeight, //商品列表每个商品元素的高度
                rowCountPerScreen: curData.rowCountPerScreen, //每屏可显示的商品行数
                goodsCountPerRow: curData.goodsCountPerRow, //每行的商品数【用户传入】
                template: curData.template, //商品的渲染模版【用户传入】
                renderCb: curData.renderCb, //当前模块每次异步渲染完后执行的回调函数【用户传入】
                sliceData: sliceData //本次异步加载需要用到的商品数据【用户传入】
            };

        //【结束下标】变成新的【开始下标】
        curData.startIndex = endIndex;

        if (curData.startIndex >= curData.data.length) {
            //如果当前模块的数据已经加载完了
            if (options.dataIndex < options.allData.length) {
                //如果当前模块不是最后一个延迟加载模块，触发下一个模块的数据加载
                options.dataIndex++;
                _this.process();
                _this.scroll();
            }
        }

        return retData;

    } else if (curData && curData.type === 'callback') {

        curData.renderCb && curData.renderCb(curData.$node);
        if (options.dataIndex < options.allData.length) {
            //如果当前模块不是最后一个延迟加载模块，触发下一个模块的数据加载
            options.dataIndex++;
            _this.process();
            _this.scroll();
        }
        return null;

    } else {

        if (!_this.hasTriggerFinish) {
            _this.hasTriggerFinish = true;
            options.finishEvent();
            options.$target.off('scroll.lazyDom');
            options.$target.off('resize.lazyDom')
        }
        return null;

    }
};

/*
 * 生成dom，并插入到页面中
 *
 * 参数说明：
 * opts 【Obj】
 * opts 对象的子属性：
 * $node 【Jquery Dom Obj】 必传，需要插入 dom 元素的目标对象
 * sliceData 【Array】 渲染 dom 所需的数据
 * template 【String】 渲染 dom 所需的模版
 * renderCb 【Function】 dom 元素成功渲染到页面中后执行的回调函数
 * */
LazyDom.prototype.createDom = function (opts) {
    var _this = this,
        options = _this.options,
        $node = opts.$node,
        htmlArr = [],
        $createEl = null;

    for (var i = 0, len = opts.sliceData.length; i < len; i++) {
        var html = template(opts.template, opts.sliceData[i]);
        htmlArr.push(html);
    }

    $createEl = $(htmlArr.join(''));

    $node.append($createEl);
    opts.renderCb($node, $createEl);
    options.renderCb($node, $createEl);

    if (options.isLazyLoad && typeof $.fn.lazyload == 'function') {
        $createEl.find('img.lazy').lazyload({
            threshold: 400,
            failure_limit: 10
        });
    }
};

/*
 * 滚动事件的回调函数，根据滚动后的页面状况，判断是否触发 dom 异步加载
 * */
LazyDom.prototype.scroll = function () {
    var _this = this,
        options = _this.options,
        newTop = options.$target.scrollTop(),
        docH = options.$doc.height();

    if (options.method == 'fromToTop') {

        if (newTop > options.oldTop) {

            var scrollHeight = newTop - options.recTop;

            if (scrollHeight > options.targetH) {

                var len = Math.floor(scrollHeight / options.targetH);
                if (docH - newTop < options.targetH) {
                    len = len + 1;
                }

                var extractData = _this.extract(len);
                if (extractData) {
                    _this.createDom(extractData);
                }

                options.recTop = newTop;

            }

            options.oldTop = newTop;

        }

    } else if (options.method == 'fromToBottom') {

        if (docH - newTop - options.targetH <= options.distanceToPageBottom) {

            var extractData = _this.extract(1);
            if (extractData) {
                _this.createDom(extractData);
            }
        }

    }

};

/*
 * 绑定 dom 延迟加载触发事件
 * */
LazyDom.prototype.bindEvent = function () {
    var _this = this,
        options = _this.options;

    options.$target.on('scroll.lazyDom', function () {
        _this.scroll();
    });

    options.$target.on('resize.lazyDom', function () {
        _this.getTargetH();
        _this.process();
        _this.scroll();
    });
};

/*
 * 检测页面初始化时是否需要触发加载
 * */
LazyDom.prototype.chkBegin = function () {
    var _this = this,
        options = _this.options,
        winH = options.$target.height(),
        docH = options.$doc.height();

    if (options.preRender && !_this.preRenderDone) {
        var sliceData = _this.extract(options.preRender);
        if (sliceData) {
            _this.createDom(sliceData);
            _this.preRenderDone = true;
        }
    }

    if (options.method == 'fromToTop') {
        if (docH < winH * 2) {
            var sliceData = _this.extract(1);
            if (sliceData) {
                setTimeout(function() {
                    _this.createDom(sliceData);
                    _this.chkBegin();
                }, 1);
            }
        }
    }
};

/*
 * 解绑 dom 延迟加载触发事件
 * */
LazyDom.prototype.destroy = function() {
    this.options.$target.off('scroll.lazyDom').off('resize.lazyDom')
};

module.exports = LazyDom;
