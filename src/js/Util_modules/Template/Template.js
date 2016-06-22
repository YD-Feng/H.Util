'use strict';
/*
 * 模板编译方法
 * 参数说明：
 * text 【String】 需要编译的模板字符串
 * data 【Object】 编译模板时所要传入的数据
 * */
var template = function (text, data) {
    var render,

        settings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g
        },

        noMatch = /(.)^/,

        matcher = new RegExp([
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g'),

        escapes = {
            '\'': '\'',
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        },

        escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g,

        index = 0,

        source = '__p+=\'';


    text.replace(matcher, function (match, interpolate, evaluate, offset) {
        source += text.slice(index, offset)
            .replace(escaper, function (match) { return '\\' + escapes[match]; });

        if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        }

        if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='";
        }

        index = offset + match.length;
        return match;
    });

    source += "';\n";

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
        "print=function(){__p+=__j.call(arguments,'');};\n" +
        source + "return __p;\n";

    try {
        render = new Function(settings.variable || 'obj', source);
    } catch (e) {
        e.source = source;
        throw e;
    }

    if (data) return render(data);
    var tpl = function (data) {
        return render.call(this, data);
    };

    tpl.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return tpl;
};

module.exports = template;
