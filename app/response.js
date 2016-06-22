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

var Take = {
    already_own: function(env) {
        return warn(`you already own *${env}*.`)
    },

    taken: function(env, owner) {
        return warn(`Sorry, *${env}* is already taken by ${owner}. They must release it first.`)
    },

    success: function(env, user) {
        return ok(`*${env}* is now taken by ${user}.`)
    }
};

var Release = {
    already_free: function(env) {
        return ok(`*${env}* is not taken by anyone.`)
    },

    not_yours: function(env, owner) {
        return error(`Sorry, you don't own *${env}*. ${owner} does.`);
    },

    success: function(env) {
        return ok(`Success. *${env}* is now free.`);
    }
};

var Error = {
    not_found: function (env) {
        return error(`*${env}* is not found`)
    },

    not_enough_params: function() {
        return error("Not enough params. See usage.");
    },

    unknown_command: function (command) {
        return error(`Unknown command '${command}'. See usage.`);
    }

};

var Response = {
    error: Error,
    add: Add,
    take: Take,
    release: Release

};

module.exports = Response;