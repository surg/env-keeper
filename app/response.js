function common(color, text) {
    return {
        response_type: "ephemeral",
        attachments: [
            {
                mrkdwn_in: ["text"],
                color: color,
                text: text
            }]
    };
}

function warn(text) {
    return common("warning", text);
}

function error(text) {
    return common("danger", text);
}

function ok(text) {
    return common("good", text);
}

var Add = {
    invalid_name: function (regex) {
        return warn(`Sorry, but the suggested name doesn't seem quite right. Try something that fits reqex ${regex}`)
    },

    banned: function() {
        return error("Sorry, man, you're banned for adding weird stuff");
    },

    success: function(env) {
        return ok(`*${env}* is successfully added.`);
    }
};

var Response = {
    add: Add,

    already_own: function(env) {
        return warn(`you already own *${env}*.`)
    }

};

module.exports = Response;