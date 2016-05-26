var Context = function (body) {
    var result = {};
    result.user = body.user_name;
    var text = body.text;
    var parts = text.split(' ');
    if (parts.length > 0) {
        result.command = parts[0];
        if (parts.length > 0)
            result.env = parts[1];
    }
    return result;
};

module.exports = Context;