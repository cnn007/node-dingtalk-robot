// text msg handler
exports.textHandle = function (content, at) {
    const data = {
        "msgtype": "text",
        "text": {
            "content": content
        },
        "at": at
    }
    return data
}

exports.linkHandle = function (text, title, picUrl, messageUrl) {
    const data = {
        "msgtype": "link",
        "link": {
            "text": text,
            "title": title,
            "picUrl": picUrl,
            "messageUrl": messageUrl
        }
    }
    return data
}

exports.markdownHandle = function (title, text, at) {
    const data = {
        "msgtype": "markdown",
        "markdown": {
            "title": title,
            "text": text
        },
        "at": at
    }
    return data
}

// todo 未实现
exports.actionCardHandle = function (title, text, singleURL) {
    const data = {
        "actionCard": {
            "title": title,
            "text": text,
            "hideAvatar": "0",
            "btnOrientation": "0",
            "singleTitle": "阅读全文",
            "singleURL": singleURL
        },
        "msgtype": "actionCard"
    }
    return data
}

exports.freeCardHandle = function (links) {
    const data = {
        "feedCard": {
            "links": links
        },
        "msgtype": "feedCard"
    }
    return data
}