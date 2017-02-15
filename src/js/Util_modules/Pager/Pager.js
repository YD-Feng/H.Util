'use strict';
/* === Class Pager begin === */
/*
 * 此类依赖于Jquery
 *
 * Pager分页模板可用数据的格式
 * ｛
 *      total: 180,
 *      apg: 1,
 *      pgc: 18,
 *      ps: 10,
 *      els: [｛
 *          pg: 1,
 *          name: 1,
 *          cls: 'ui-pager-active'
 *      ｝,｛
 *          pg: 2,
 *          name: 2,
 *          cls: 'ui-pager-can'
 *      ｝]
 * ｝
 *
 * 数据字段说明：
 * total —— 记录总条数
 * apg —— 当前页
 * pac —— 总页数
 * ps —— 每页显示条数
 * els —— 页码元素list
 * els|pg —— 点击页码要跳转到的页数（可能为空，空则不进行换页）
 * els|name —— 页码元素的内容（文字）
 * els|cls —— 页码元素的 css class
 * */
var Pager = function (opts) {
    var _this = this;

    _this.bindEventFlag = true; //事件是否已绑定标记
    _this.tplT = opts.tplT || null; //上分页模板（列表上方的简单分页）
    _this.tplB = opts.tplB || null; //下分页模板（列表下方的常规分页）
    _this.wrapT = opts.wrapT || null; //上分页容器（列表上方的简单分页）
    _this.wrapB = opts.wrapB || null; //下分页容器（列表上方的简单分页）
    _this.goToPageFunc = opts.goToPageFunc || null; //分页跳转回调

    //可点击的页码的class
    _this.canClkCls = opts.canClkCls || 'ui-pager-can';
    //不可点击的页码的class
    _this.cantClkCls = opts.cantClkCls || 'ui-pager-cant';
    //当前页码的class
    _this.activeCls = opts.activeCls || 'ui-pager-active';

    return _this;
};

/*
 * 分页模块渲染方法
 * 参数说明：
 * options type｛obj｝
 *
 * 属性
 * pg 【Int,Int-String】 当前页页码
 * total 【Int,Int-String】 数据总数
 * ps 【Int,Int-String】 每页条数
 * */
Pager.prototype.render = function (options) {
    var _this = this,
        pageData = _this.transformOpts(options),
        template = require('../Template/Template'),//PS:这里依赖了 Template 模块
        contT = _this.tplT ? template(_this.tplT, {
            total: pageData['total'],
            apg: pageData['pg'],
            pgc: pageData['page_count'],
            ps: pageData['ps'],
            els: pageData['simple_page_els']
        }) : '',
        contB = _this.tplB ? template(_this.tplB, {
            total: pageData['total'],
            apg: pageData['pg'],
            pgc: pageData['page_count'],
            ps: pageData['ps'],
            els: pageData['page_els']
        }) : '';

    _this.wrapT && _this.wrapT.html(contT);
    _this.wrapB && _this.wrapB.html(contB);

    if (_this.bindEventFlag) {
        //如果还没绑定事件
        _this.bindEvents();
    }
};

/*
 * 分页数据生产方法
 * 参数说明：
 * options type｛obj｝
 *
 * 属性
 * pg 【Int,Int-String】 当前页页码
 * total 【Int,Int-String】 数据总数
 * ps 【Int,Int-String】 每页条数
 * */
Pager.prototype.transformOpts = function (options) {
    var _this = this,
        pg = options.pg * 1,
        pageCount = Math.ceil(options.total / options.ps),
        simplePageEls = [],
        pageEls = [],
        canClkCls = _this.canClkCls,
        cantClkCls = _this.cantClkCls,
        activeCls = _this.activeCls;

    if (pageCount < 9) {
        //总页数小于9页
        for (i = 1; i <= pageCount; i++) {
            pageEls.push({
                pg: i,
                name: i,
                cls: canClkCls
            });
        }
    } else {
        //总页数大于或等于9页
        if (pg < 4) {
            //小于第4页
            if (pg !== 1) {
                //不是第1页
                pageEls.unshift({
                    pg: pg - 1,
                    name: '&lt;',
                    cls: canClkCls
                },{
                    pg: 1,
                    name: 1,
                    cls: canClkCls
                });
            } else {
                //是第1页
                pageEls.unshift({
                    pg: '',
                    name: '&lt;',
                    cls: cantClkCls
                },{
                    pg: 1,
                    name: 1,
                    cls: canClkCls
                });
            }

            //插入第2页到第6页
            for (var i = 2; i <= pg + 3; i++) {
                pageEls.push({
                    pg: i,
                    name: i,
                    cls: canClkCls
                });
            }

            //插入省略号，最后一页，下一页
            pageEls.push({
                pg: '',
                name: '...',
                cls: cantClkCls + ' ui-pager-dot'
            },{
                pg: pageCount,
                name: pageCount,
                cls: canClkCls
            },{
                pg: pg + 1,
                name: '&gt;',
                cls: canClkCls
            });
        } else {
            //大于等于第4页

            //在数组最前端插入上一页，1页
            pageEls.unshift({
                pg: pg - 1,
                name: '&lt;',
                cls: canClkCls
            },{
                pg: 1,
                name: 1,
                cls: canClkCls
            });

            var num = 2;
            if (pg != 4) {
                //不是第四页，插入省略号
                pageEls.push({
                    pg: '',
                    name: '...',
                    cls: cantClkCls + ' ui-pager-dot'
                });

                if (pageCount - 3 != pg) {
                    num = 3;
                }
            }

            for (var i = num; i >= 0; i--) {
                pageEls.push({
                    pg: pg - i,
                    name: pg - i,
                    cls: canClkCls
                });
            }

            if (pg + 3 < pageCount) {
                //当前页距最后一页还有大于3页
                pageEls.push({
                    pg: pg + 1,
                    name: pg + 1,
                    cls: canClkCls
                },{
                    pg: pg + 2,
                    name: pg + 2,
                    cls: canClkCls
                },{
                    pg: '',
                    name: '...',
                    cls: cantClkCls + ' ui-pager-dot'
                },{
                    pg: pageCount,
                    name: pageCount,
                    cls: canClkCls
                },{
                    pg: pg + 1,
                    name: '&gt;',
                    cls: canClkCls
                });
            } else {
                //当前页距最后一页还有小于或等于3页
                for (i = pg + 1; i <= pageCount; i++) {
                    pageEls.push({
                        pg: i,
                        name: i,
                        cls: canClkCls
                    });
                }

                if (pg !== pageCount) {
                    pageEls.push({
                        pg: pg + 1,
                        name: '&gt;',
                        cls: canClkCls
                    });
                } else {
                    pageEls.push({
                        pg: '',
                        name: '&gt;',
                        cls: cantClkCls
                    });
                }
            }
        }
    }

    for (var i = 0, len = pageEls.length; i < len; i++) {
        if (pageEls[i]['pg'] == pg) {
            pageEls[i]['cls'] = pageEls[i]['cls'] + ' ' + activeCls;
            pageEls[i]['pg'] = '';
        }
    }

    simplePageEls.push({
        pg: pg == 1 ? '' : pg - 1,
        name: '&lt;',
        cls: pg == 1 ? canClkCls + ' ' + activeCls : canClkCls
    },{
        pg: pg == pageCount ? '' : pg + 1,
        name: '&gt;',
        cls: pg == pageCount ? canClkCls + ' ' + activeCls : canClkCls
    });

    options['page_els'] = pageEls;
    options['simple_page_els'] = simplePageEls;
    options['page_count'] = pageCount;

    return options;
};

/*
 * 事件绑定方法
 * */
Pager.prototype.bindEvents = function () {
    var _this = this;
    _this.wrapT && _this.wrapT
        .on('click', '.J-page-to', function () {
            var pg = $(this).data('pg');
            if (pg) {
                _this.goToPageFunc(pg);
            }
        });

    _this.wrapB && _this.wrapB
        .on('click', '.J-page-to', function () {
            var pg = $(this).data('pg');
            if (pg) {
                _this.goToPageFunc(pg);
            }
        })
        .on('click', '.J-page-go-btn', function (e) {
            var $this = $(this),
                pg = _this.wrapB.find('input.J-page-go-input').val() * 1,
                curPg = $this.data('curPage') * 1,
                maxPg = $this.data('maxPage') * 1;

            if (!isNaN(pg)) {
                var _pg = pg > maxPg ? maxPg : (pg < 1 ? 1 : pg);
                if (_pg != curPg) {
                    _this.goToPageFunc(_pg);
                }
            }
        });

    _this.bindEventFlag = false;
};

module.exports = Pager;
