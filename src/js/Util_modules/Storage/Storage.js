'use strict';
/* === Class Storage begin === */
var Storage = function () {
    var _this = this;
    _this.LS_flag = !!window.localStorage;

    if (_this.LS_flag) {
        _this.storage = window.localStorage;
    } else {
        _this.storage = null;
        _this.hostName = 'storageForOldBrowser';

        try {
            _this.storage = document.createElement('INPUT');
            _this.storage.type = 'hidden';
            _this.storage.style.display = 'none';
            _this.storage.addBehavior ('#default#userData');
            document.body.appendChild(_this.storage);
            var expires = new Date();
            expires.setDate(expires.getDate() + 365);
            _this.storage.expires = expires.toUTCString();
        } catch(e) {
            alert('Storage Object create error!');
        }
    }
};

/*
 * 参数说明：
 * key 【String】 目标键名
 * */
Storage.prototype.get = function (key) {
    var _this = this;

    if (_this.storage) {

        if (_this.LS_flag) {
            return _this.storage.getItem(key);
        } else {
            _this.storage.load(_this.hostName);
            var value = _this.storage.getAttribute(key);

            if (value === null || value === undefined) {
                value = '';
            }
            return value;
        }

    }
};

/*
 * 参数说明：
 * key 【String】 目标键名（为了避免在IE6上产生报错，请不要以数字或特殊符号作为键名开头）
 * value 【String】 要设置的值
 * */
Storage.prototype.set = function (key, value) {
    var _this = this;

    if (_this.storage) {

        if (_this.LS_flag) {
            _this.storage.setItem(key, value);
        } else {
            _this.storage.load(_this.hostName);
            _this.storage.setAttribute(key, value);
            _this.storage.save(_this.hostName);
        }

    }
};

/*
 * 参数说明：
 * key 【String】 目标键名
 * */
Storage.prototype.remove = function (key) {
    var _this = this;

    if (_this.storage) {

        if (_this.LS_flag) {
            _this.storage.removeItem(key);
        } else {
            _this.storage.load(_this.hostName);
            _this.storage.removeAttribute(key);
            _this.storage.save(_this.hostName);
        }

    }
};

module.exports = Storage;