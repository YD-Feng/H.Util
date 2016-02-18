#H.Util项目中包含了 H.UI、H.Util 和 H.Dialog 三部分<br />  
<br />

#H.UI
H.UI 是集各家所长所诞生出来的产物<br />
融合了 bootstrap、VUI（出自唯品会）、Jquery-UI、以及 H.UI 本身的原创成分<br />
它本着解决最基础的问题而生，因此它的功能简单且专注<br />
在它里面没看似很叼的栅格系统，也没有酷炫的动画效果类，它只实现了按钮，输入框等一些最基本的原件样式<br />
具体用法和实际效果请移步运行 demo 查看<br />


<br /><br /><br />

#H.Util
H.Util 不是一个单一功能的插件，而是一系列轻量工具的集合<br />
由于各个工具之间存在着相互依赖关系，所以就做成了一个工具集的形式<br />
即便包含了很多小工具，它的大小依然只有40多K，而且还是未压缩状态<br />
所以完全不必担心它会因为包含了很多小工具而变得臃肿<br />

<br />

##H.Util 所包含的工具有：
* **[Monitor](#Monitor)**<br />
监听器，可以监听信息，并在接收到信息后触发指定的回调函数。也可以理解为一种脱离 DOM 的事件定义和处理工具<br /><br />
* **[Storage](#Storage)**<br />
本地缓存，假如浏览器不支持 localStorage，会改用 userData 来实现同样的功能，因此有很高兼容性<br /><br />
* **[ItvEvents](#ItvEvents)**<br />
事件定频器，它的作用是，使得绑定在指定元素上的指定事件的触发函数产生一定执行时间间隔，避免高频率触发事件时，函数随之高频率执行，以致影响应用的运行速度<br /><br />
* **[JsLoader](#JsLoader)**<br />
js脚本异步加载器，可以异步加载脚本，防止 DOM 加载阻塞，另外还支持依赖关系定义，保证脚本按照需要顺序加载<br /><br />
* **[Pager](#Pager)**<br />
分页生成器，通过异步请求的方式生成列表分页时非常有用<br /><br />
* **[Template](#Template)**<br />
模版引擎，源自知名的 underscore，非常小巧，功能强大，用于模版编译，从此和 HTML 拼接工作 say goodbye<br /><br />
* **[Tooltips](#Tooltips)**<br />
提示气泡工具，用于生产提示气泡，轻量、灵活、兼容性好<br /><br />
* **[GetStrCodeLength](#GetStrCodeLength)**<br />
获取字符串的字符长度方法（一个汉字为2字符长度）<br /><br />
* **[SubStrByCode](#SubStrByCode)**<br />
根据字符长度截字方法，由于汉字和英文数字的字符长度不同，按字数截字的效果往往无法满足有追求的工程师，此方法应运而生<br /><br />
* **[TransformParamsToJSON](#TransformParamsToJSON)**<br />
将序列化得到的参数字符串转换为JSON对象，常用于地址栏参数和表单序列化参数的处理<br /><br />
* **[DateFormat](#DateFormat)**<br />
日期格式化方法，用于将日期转换成各种不同的显示格式<br />
<br />

<br />

#<a name="Monitor"></a>H.Monitor
H.Monitor 对象提供了3个方法：<br />
**H.Monitor.listen、H.Monitor.trigger、H.Monitor.unListen**<br />
<br /><br />
下面是3个方法的调用实例，注释是参数说明：
```
/*
 * H.Monitor.listen(condition, func);
 * 参数说明：
 * condition 【String】
 * 触发条件list的表达字符串，各个条件由英文逗号','分隔开
 * 字符串中的所有空格符都会被过滤掉，建议仅用英文和数字组织触发条件名
 * func 【function】 满足触发条件时，需要触发的函数
 * */

H.Monitor.listen('getData', function () {
    alert('success');
});
```

```
/*
 * H.Monitor.trigger(condition, params);
 * 参数说明：
 * condition 【String】
 * 触发条件名
 * 字符串中的所有空格符都会被过滤掉，建议仅用英文和数字组织触发条件名
 * params 【obj】
 * 满足触发条件时，传给触发的函数的公共参数
 * 多个触发条件分开触发时，分别传入的 params 参数对象将会合并（extend）
 * */

H.Monitor.trigger('getData', {
    name: 'Jack'
});
```

```
/*
 * H.Monitor.unListen(condition);
 * 参数说明：
 * condition 【String】
 * 触发条件list的表达字符串，各个条件由英文逗号','分隔开
 * 字符串中的所有空格符都会被过滤掉，建议仅用英文和数字组织触发条件名
 * */

H.Monitor.unListen('getData');
```

<br />

#<a name="Storage"></a>H.Storage
H.Storage 对象提供了3个方法：<br />
**H.Storage.get、H.Storage.set、H.Storage.remove**<br />
<br /><br />
下面是3个方法的调用实例，注释是参数说明：
```
/*
 * H.Storage.get(key);
 * 参数说明：
 * key 【String】 目标键名
 * */

H.Storage.get('myStorage');
```

```
/*
 * H.Storage.set(key, value);
 * 参数说明：
 * key 【String】 目标键名（为了避免在IE6上产生报错，请不要以数字或特殊符号作为键名开头）
 * value 【String】 要设置的值
 * */

H.Storage.set('myStorage', 1);
```

```
/*
 * H.Storage.remove(key);
 * 参数说明：
 * key 【String】 目标键名
 * */

H.Storage.remove('myStorage');
```

<br />

#<a name="ItvEvents"></a>H.ItvEvents
H.ItvEvents 对象提供了2个方法：<br />
**H.ItvEvents.addEvent、H.ItvEvents.removeEvent**<br />
<br /><br />
下面是2个方法的调用实例，注释是参数说明：
```
/*
 * H.ItvEvents.addEvent($el, eventType, eventName, fn, itvTime);
 * 参数说明：
 * $el 【JqueryObj】 要绑定事件的JqueryDOM对象
 * eventType 【String】 要绑定的事件类型
 * eventName 【String】 事件的命名空间
 * fn 【Function】 事件触发时要执行的函数
 * itvTime 【Int】 事件被连续触发时，对应的函数的执行间隔
 * */

H.ItvEvents.addEvent($(window), 'resize', 'resetSomeThing', function () {
    $('#someThing').width($(window).width());
}, 300);
```

```
/*
 * H.ItvEvents.removeEvent($el, eventType, eventName);
 * 参数说明：
 * $el 【JqueryObj】 要绑定事件的JqueryDOM对象
 * eventType 【String】 要绑定的事件类型
 * eventName 【String】 事件的命名空间
 * */

H.ItvEvents.removeEvent($(window), 'resize', 'resetSomeThing');
```

<br />

#<a name="JsLoader"></a>H.JsLoader
H.JsLoader 对象提供了1个方法：<br />
**H.JsLoader.get**<br />
<br /><br />
下面是这个方法的调用实例，注释是参数说明：
```
/*
 * H.JsLoader.get(module[, module...]);
 * 参数说明：
 * module 【Obj】【可以传多个,表示加载多个脚本】
 * 每个 module 对象包含了4个属性：
 * name 【String】 必传，要引入 JS 的模块名
 * url 【String】 必传，要引入 JS 的路径
 * requires 【String Array】 可选，此脚本依赖的模块（所依赖模块的模块名组成的集合）
 * callBack 【Function】 回调函数，脚本加载完后执行的回调函数
 * */

//加载单个脚本
HaierJS.JsLoader.get({
    name: 'avalon',
    url: 'vendor/avalon/avalon.shim.js'
});

//加载多个脚本
HaierJS.JsLoader.get({
    name: 'companyIndex',
    url: 'js/company-index.js',
    requires: ['avalon', 'jcrop', 'plupload']
}, {
    name: 'avalon',
    url: 'vendor/avalon/avalon.shim.js'
}, {
    name: 'jcrop',
    url: 'vendor/jcrop/jquery.Jcrop.min.js'
}, {
    name: 'plupload',
    url: 'vendor/plupload/plupload.full.min.js'
});
```

<br />

#<a name="Pager"></a>H.Pager
H.Pager 是一个类，能生产多个实例。H.Pager 对象提供了1个方法：<br />
**pagerObj.render**<br />
<br /><br />
下面是调用实例，注释是参数说明：
```
/*
 * 构造函数 参数说明：
 * 构造函数需要传入一个对象作为参数，该对象包含5个属性：
 * tplT 【String】 列表上方分页模板（列表上方的简单分页）
 * tplB 【String】 列表下方分页模板（列表下方的常规分页）
 * wrapT 【JqueryObj】 列表上方分页容器（列表上方的简单分页）
 * wrapB 【JqueryObj】 列表下方分页容器（列表上方的简单分页）
 * goToPageFunc 【Function】 点击分页按钮后的回调，该函数包含一个参数 pageNum，表示要跳转的目标页页码
 * */

//实例化
var pagerA = new H.Pager({
    tplT : $('#J-page-tpl-t').html(),
    tplB : $('#J-page-tpl-b').html(),
    wrapT : $('#J-page-wrap-t'),
    wrapB : $('#J-page-wrap-b'),
    goToPageFunc : function (pageNum) {
        //...
    }
});
```

```
/*
 * pagerObj.render(opts);
 * 参数说明：
 * opts 【Obj】
 * opts 对象包含了3个属性：
 * pg 【Int,Int-String】 当前页页码
 * total 【Int,Int-String】 数据总数
 * ps 【Int,Int-String】 每页条数
 * */

//渲染生成分页
pagerA.render({
    pg: 5,
    total: 120,
    ps: 10
});
```

<br />

#<a name="Template"></a>H.template
H.template 本身就是一个静态方法：<br />
<br /><br />
下面是调用实例，注释是参数说明：
```
/*
 * H.template(text, data);
 * 参数说明：
 * text 【String】 需要编译的模板字符串
 * data 【Object】 编译模板时所要传入的数据，注意它必须是一个对象，不能是一个数组，如果要传入数组，请在外部多包装一层
 * */

H.template($('#J-tpl-a').html(), {
    partName: '美女排行榜',
    list: [{
        name: '貂蝉',
        weight: 45
    },{
        name: '大乔',
        weight: 40
    },{
        name: '小乔',
        weight: 42
    },{
        name: '凤姐！很丑怎么办！',
        weight: 100
    }]
});
```

<br />

#<a name="Tooltips"></a>H.Tooltips
H.Tooltips 对象包含3个方法：<br />
**H.Tooltips.create、H.Tooltips.show、H.Tooltips.hide**<br />
<br /><br />
下面是3个方法的调用实例，注释是参数说明：
```
/*
 * H.Tooltips.create(opts);
 * 参数说明：
 * opts 【Obj】
 * opts 对象包含了多个属性：
 * target 【JqueryObject】 必传，需要添加 tooltips 的目标元素
 * content 【String|function】 必传，提示框的内容，如果传入的是 function，则要求该函数必须返回一个字符串
 * side 【string】 提示框展示在目标元素的哪一边（取值范围：'top'， 'bottom'， 'left'， 'right'）
 * contSide 【string】 提示框内容部分展示配置，与 side 配合使用【string】（side 为 left 或 right 时的取值范围：'top'，'bottom'，'middle'; side 为 top 或 bottom 时的取值范围：'left'，'right'，'middle'; 注意，设置此属性后，插件将不会自动判断展示哪一侧）
 * theme 【string】 提示框主题（默认值：''， 取值范围：''， 'info'， 'success'， 'warning'， 'error'）
 * position 【Object - Int】 用来调整提示框的位置偏移的一个对象，包含两个属性 top 和 left， top 和 left 的值必须为数字
 * width 【Int】 提示框的宽度（默认值：0， 默认情况下，宽度是自适应的，但是当 content 的内容是纯文本时，请务必设置 tooltips 宽度，否则可能会出现意想不到的意外结果出现）
 * eventShow 【string】 提示框显示触发事件（默认值:'mouseenter'）
 * eventHide 【string】 提示框隐藏触发事件（默认值:'mouseleave'，当 eventShow 的值为 'click' 时，eventHide 会被强行无效化。改为点击提示框以外的区域触发隐藏）
 * onShow 【function】 提示框显示后的回调，有一个参数，传入的是所生成的提示框的 JqueryObject
 * onHide 【function】 提示框隐藏后的回调，有一个参数，传入的是生成的提示框的 JqueryObject
 * */

H.Tooltips.create({
    target : $('#J-button-demo02'),
    content : $('#J-tpl-demo01').html(),
    side : 'bottom',
    contSide : 'right',
    theme : 'info',
    position : {
        top : 0,
        left : 0
    },
    width : 0,
    eventShow : 'click',
    eventHide : 'blur',
    onShow : function ($toolTips) {
        //alert('提示框显示了~');
    },
    onHide : function ($toolTips) {
        //alert('提示框隐藏了~');
    }
});
```

```
/*
 * H.Tooltips.show($target);
 * 参数说明：
 * $target 【JqueryObj】 tooltips 提示框的 JqueryObj
 * */

H.Tooltips.show($('#J-tooltips-dom'));
```

```
/*
 * H.Tooltips.hide($target);
 * 参数说明：
 * $target 【JqueryObj】 tooltips 提示框的 JqueryObj
 * */

H.Tooltips.hide($('#J-tooltips-dom'));
```

<br />

#<a name="GetStrCodeLength"></a>H.getStrCodeLength
H.getStrCodeLength 本身就是一个静态方法：<br />
<br /><br />
下面是调用实例，注释是参数说明：
```
/*
 * H.getStrCodeLength(str)
 * 参数说明：
 * str 【String】 需要获取字符长度的字符串
 * */

H.getStrCodeLength('1000米到底有多长')
```

<br />

#<a name="SubStrByCode"></a>H.subStrByCode
H.subStrByCode 本身就是一个静态方法：<br />
<br /><br />
下面是调用实例，注释是参数说明：
```
/*
 * H.subStrByCode(str, codeLength, flag, EnglishType)
 * 参数说明：
 * str 【String】 需要处理的字符串
 * codeLength 【Int】 需求截字的长度
 * flag 【Bool】 是否要保留头尾空格符，默认值为 false
 * EnglishType 【Bool】 是否开启英文截字模式（英文截字模式下，截字末尾如果将单词截断了，就会把末尾被截断的单词部分也去除掉），默认值为 false
 * PS：EnglishType 参数放在最后，因为在中文环境，如果将 EnglishType 设置为 true，会出现意想不到的结果。因此中文环境下使用此参数需慎重
 * */

H.subStrByCode('超长的东东1律kaca掉~~~超长的东东1律kaca掉~~~', 20)
```

<br />

#<a name="TransformParamsToJSON"></a>H.transformParamsToJSON
H.transformParamsToJSON 本身就是一个静态方法：<br />
<br /><br />
下面是调用实例，注释是参数说明：
```
/*
 * H.transformParamsToJSON(paramsStr)
 * 参数说明：
 * paramsStr 【String】 参数字符串
 * 注意：paramsStr 的格式必须为 "?orderId=44412000008&srcOrderId=123456789001&operationType=edit&orderType=30" 这样的格式。前面的 ? 可有可无，可以只有参数名，没有参数值
 * */

H.transformParamsToJSON('?orderId=AD160115144412000008&srcOrderId=src123456789001&operationType=edit&orderType=30')
```

<br />

#<a name="DateFormat"></a>DateObj.format
DateObj.format 是对 Date 对象的方法扩展：<br />
<br /><br />
下面是调用实例，注释是参数说明：
```
/*
 * DateObj.format(type)
 * 参数说明：
 * type 【String】 和大多数的日期格式化方法一样，由不同字母构成不同的格式化规则：
 * y - 年
 * M - 月
 * d - 日
 * h - 时（12小时制）
 * H - 时（24小时制）
 * m - 分
 * s - 秒
 * S - 毫秒
 * q - 季度
 * E - 星期几
 * */

var now = new Date();
now.format('yyyy-MM-dd');
```

<br /><br /><br />


#H.dialog
原版官方文档：[http://aui.github.io/artDialog/doc/index.html](http://aui.github.io/artDialog/doc/index.html)
如果例子中的属性配置不能满足需要，可参考原版官方文档

<br />

调用实例一【常规弹窗】：
```
var d = H.dialog({
    title: 'Title',
    content: '这里只显示文案',
    timeout: 3000,
    quickClose: true,
    width: 300,
    backdropOpacity: 0.7,
    onshow: function(){
        //alert('弹窗弹出后执行的回调');
    },
    onremove: function(){
        //alert('弹窗移除后执行的回调');
    }
});

d.show();
```

<br />

调用实例二【不会自动销毁的弹窗】：
```
//定义一个弹窗
var myDialog = H.dialog({
    showCloseBtn: true,
    setMaxSize: true,
    content: $('#J-tpl-demo01').html(),
    quickClose: true,
    padding: 5,
    width: 400,
    height: 200,
    removeFlag: false,
    backdropOpacity: 0.7,
    onshow: function(){
        //alert('弹窗弹出后执行的回调');
    },
    onclose: function(){
        //alert('弹窗关闭后执行的回调');
    }
});

//不会自动销毁的弹窗，请使用 showModal 显示出来，否则遮罩层会无法显示
myDialog.showModal();
```

<br />

dialog 初始化时可以传入一个对象，对象的属性就是配置项，下面是初始化配置项详解：

###title 【String】
弹窗标题
<br /><br />

###content 【String】
弹窗内容
<br /><br />

###quickClose 【Bool】
是否点击空白处快速关闭
<br /><br />

###padding 【Int】
弹窗内边距(当 title 属性没设置时，且 showCloseBtn 属性设置为 true 或者没设置【默认值就是 true】，padding 属性会被强制设置为 0)
<br /><br />

###width 【Int】
弹窗宽度(缺省时为自适应，但默认最大宽度为 1000)
<br /><br />

###height 【Int】
弹窗高度(缺省时为自适应，但默认最大高度为 600)
<br /><br />

###timeout 【Int】
多长时间后自动关闭（单位：毫秒）
<br /><br />

###backdropOpacity 【Number】
遮罩层透明度 (默认0.7)
<br /><br />

###onshow 【Function】
弹窗弹出后执行的回调
<br /><br />

###onremove 【Function】
弹窗移除后执行的回调（请与 onclose 区别开来，大多数情况下请用 onremove，只有在 removeFlag 设为 false 时，才用 onclose）
<br /><br />

###onclose 【Function】
弹窗关闭后执行的回调（请与 onclose 区别开来，大多数情况下请用 onremove，只有在 removeFlag 设为 false 时，才用 onclose）
<br /><br />

###showCloseBtn 【Bool】
【高级选项】是否生成关闭按钮（当 title 属性没设置时，此属性才会生效，默认为 true，设置为 false 时，就不会为用户生成关闭按钮）
<br /><br />

###setMaxSize 【Bool】
【高级选项】是否指定弹窗的最大高度（默认为true，绝大多数情况下使用默认值即可，特殊情况下可设为false）
<br /><br />

###removeFlag 【Bool】
【高级选项】关闭窗口时，是否销毁 dom，默认为 true。当设置为 false 时，quickClose 配置属性会强制设为 false （因为 quickClose 触发的关闭弹窗会把 dom 销毁）
<br /><br />

#基于 H.dialog 的其他方法
以下的几个方法，是根据功能需求对 H.dialog 的再封装。
下面一一列出这些方法的调用实例，以及参数说明：

###H.alert（信息提示弹框）
```
/*
* 参数说明：
* H.alert(msg, [timeout], [callback]);
* msg —— 提示语内容
* timeout —— 提示框的存在时间
* callback —— 提示框关闭后的回调函数
* */
H.alert('一堆提示语', 1000, function () {
    console.info(1);
});
```

###H.confirm（确认信息弹框）
```
//确认信息弹框的 title 属性会被强制无效化
var d = H.confirm({
    content: '你确定要打我？',//确认信息内容
    quickClose: true,//点击空白处快速关闭
    width: 300,//弹框宽度
    okValue: '确定',//确定按钮上的文案
    backdropOpacity: 0.7,//遮罩层透明度(默认0.7)
    ok: function () {
        alert('点击[确定]按钮执行的回调');
    },
    cancelValue: '取消',//取消按钮上的文案
    cancel: function () {
        alert('点击[取消]按钮执行的回调');
    }
});

d.show();
```

###H.frameBox（iframe弹框）
```
//iframe 弹框的尺寸会根据子页面的大小变化而变化，但最大也不大于配置中所设置的 width 和 height
var d = H.frameBox({
    title: 'iframe 弹框',//弹框标题
    content: 'demo-iframeInnerPage.html',//iframe 弹窗内容,也就是 iframe 的 src
    width: 800,//弹框最大宽度
    height: '80%',//弹框最大高度
    onshow: function(){
        //alert('弹窗弹出后执行的回调');
    },
    onclose: function(){
        //alert('弹窗关闭后执行的回调');
    }
});

d.show();
```
