var util = require('util');

function template(text) {
    return {
        response_type: "in_channel",
        text: "text"
    };
}

var Response = function (ctx) {
    return {
        env_not_found: template(`${ctx.env} is not found`)
    };
};

module.exports = Response;