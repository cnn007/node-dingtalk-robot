/**
 * TODO
 * 钉钉 dingtalk_robot 机器人
 *
 *【注意，发起POST请求时，必须将字符集编码设置成UTF-8】
 * 获取到Webhook地址后，用户可以使用任何方式向这个地址发起HTTP POST 请求，即可实现给该群组发送消息。
 * 当前自定义机器人支持文本（text）、连接（link）、markdown（markdown）三种消息类型，大家可以根据自己的使用场景选择合适的消息类型，达到最好的展示样式。具体的消息类型参考下一节内容。
 * 自定义机器人发送消息时，可以通过手机号码指定“被@人列表”。在“被@人列表”里面的人员，在收到该消息时，会有@消息提醒（免打扰会话仍然通知提醒，首屏出现“有人@你”）
 *
 * created by cnn
 * date: 2017-09-29 16:15:02
 */
const crypto = require('crypto')
const urllib = require('urllib')
const msgUtil = require('./msg_handle')

// send
const URLS_SEND = 'https://oapi.dingtalk.com/robot/send?access_token='

var DingTalkRobot = function (config, debug = false) {
    if (!config) throw new Error('参数不能为空');
    if (!config.appid) throw new Error('appid为必传参数');
    this.appid = config.appid
    this.debug = debug;
}

// text
DingTalkRobot.prototype.sendText = function (params, callback) {
    var pkg = Object.assign({}, params, {
        appid: this.appid,
    });

    var needs = ['content'];
    return this.request(pkg, {appid: this.appid, needs, type: 'text'}, callback);
};

// link
DingTalkRobot.prototype.sendLink = function (params, callback) {
    var pkg = Object.assign({}, params, {
        appid: this.appid,
    });

    var needs = ['title', 'text', 'messageUrl'];
    return this.request(pkg, {appid: this.appid, needs, type: 'link'}, callback);
};

// markdown
DingTalkRobot.prototype.sendMarkdown = function (params, callback) {
    var pkg = Object.assign({}, params, {
        appid: this.appid,
    });

    var needs = ['title', 'text'];
    return this.request(pkg, {appid: this.appid, needs, type: 'markdown'}, callback);
};

// todo actionCard
DingTalkRobot.prototype.sendActionCard = function (params, callback) {
    var pkg = Object.assign({}, params, {
        appid: this.appid,
    });

    var needs = ['title', 'text', 'singleTitle', 'singleURL'];
    return this.request(pkg, {appid: this.appid, needs, type: 'actionCard'}, callback);
};

// todo freeCard
DingTalkRobot.prototype.sendFreeCard = function (params, callback) {
    var pkg = Object.assign({}, params, {
        appid: this.appid,
    });
    var needs = [];
    return this.request(pkg, {appid: this.appid, needs, type: 'feedCard'}, callback);
};

/* 其它依赖方法 */
// 发起请求: 自动区分callback或promise
DingTalkRobot.prototype.request = function (params, options, callback) {
    var that = this;
    // callback
    if (typeof callback == 'function') return that._request(params, options, callback);
    // promise
    return new Promise(function (resolve, reject) {
        that._request(params, options, function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};
// 发起请求(原始方法)
DingTalkRobot.prototype._request = function (params, options, callback) {
    var that = this;
    var appid = options.appid;
    var needs = options.needs || [];
    //消息类型 text,link
    var type = options.type;

    // 验证参数合法且完整
    var missing = [];
    needs.forEach(function (key) {
        var keys = key.split('|');
        for (var i = 0; i < keys.length; i++) {
            if (params[keys[i]]) return;
        }
        missing.push(key);
    });
    if (missing.length) return callback('missing params: ' + missing.join(', '));

    let data = {};
    switch (type) {
        case 'text':
            data = msgUtil.textHandle(params.content, params.at)
            break
        case 'link':
            //text, title, picUrl, messageUrl
            data = msgUtil.linkHandle(params.text, params.title, params.picUrl, params.messageUrl)
            break
        case 'markdown':
            //title, text, at
            data = msgUtil.markdownHandle(params.title, params.text, params.at)
            break
        case 'actionCard':
            //title, text, singleURL
            data = msgUtil.actionCardHandle(params.title, params.text, params.singleURL)
            break
        case 'feedCard':
            // links
            data = msgUtil.freeCardHandle(params.links)
            break
        default:
            console.log('fail invalid type:', type)
            break
    }

    // 创建请求参数
    var pkg = {
        method: 'POST',
        data: data,
        headers: {
            "Content-Type": "application/json",
            "charset": "utf-8"
        }
    };
    // console.log('pkg', JSON.stringify(pkg))
    urllib.request(URLS_SEND + appid, pkg, function (err, data, res) {
        if (err) return callback(err);
        // console.log(data.toString());
        that.validate(data.toString(), appid, callback);
    });
};

// 数据合法性验证: 自动区分callback或promise
DingTalkRobot.prototype.validate = function (xml, type, callback) {
    if (typeof type == 'function') {
        callback = type;
        type = null;
    }

    var that = this;
    // callback
    if (typeof callback == 'function') return that._validate(xml, type, callback);
    // promise
    return new Promise(function (resolve, reject) {
        that._validate(xml, type, function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
}

// 数据合法性验证(原始方法)
DingTalkRobot.prototype._validate = function (result, type, callback) {
    var that = this;
    if (that.debug) console.info('---- robot debug ----\n' + result + '\n' + type);
    if (result.errcode != 0) {
        callback(null, result);
    }
};

module.exports = DingTalkRobot;