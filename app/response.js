function common(obj) {
    obj.response_type = "ephemeral";
    return obj;
}
function warn(text) {
    return common({
        attachments: [
            {
                mrkdwn_in: ["text"],
                color: "warning",
                text: text
            }]
    });
}

var Response = {
    env_add_invalid_name: function (regex) {
        return warn(`Sorry, but the suggested name doesn't seem quite right. Try something that fits reqex ${regex}`)
    }
};

module.exports = Response;