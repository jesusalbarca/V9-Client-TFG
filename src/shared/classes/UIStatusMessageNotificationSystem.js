class UIStatusMessage {
    constructor(msg, title = "Info", type = "info") {
        this.type = type; /* info, success, warning, error */
        this.title = title;
        this.msg = msg;
    }
}
class ErrorSpecs {
    constructor(code, message, context) {
        this.code = code; /* info, success, warning, error */
        this.message = message;
        this.context = context;
    }
}

function clearStatusMessage(session) {
    delete session.status_msg;
}


module.exports = {
    UIStatusMessage,
    clearStatusMessage

}