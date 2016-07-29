var moment = require('moment');

var EPHEMERAL_RESPONSE = "ephemeral";
var INCHANNEL_RESPONSE = "in_channel";

function base(attachments) {
    return {
        response_type: EPHEMERAL_RESPONSE,
        attachments: attachments
    }
}
function common(color, text) {
    return base([
            {
                mrkdwn_in: ["text"],
                color: color,
                text: text
            }]);
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

    success: function (env) {
        return ok(`*${env}* is successfully added.`);
    }
};

var Take = {
    already_own: function (env) {
        return warn(`you already own *${env}*.`)
    },

    taken: function (env, owner) {
        return warn(`Sorry, *${env}* is already taken by ${owner}. They must release it first.`)
    },

    success: function (env, user) {
        return ok(`*${env}* is now taken by ${user}.`)
    },

    seized: function(env, owner, user) {
        var resp = ok(`${env} was seized from @${owner} by ${user}`);
        resp.response_type = INCHANNEL_RESPONSE;
        return resp;
    }
};

var Release = {
    already_free: function (env) {
        return ok(`*${env}* is not taken by anyone.`)
    },

    not_yours: function (env, owner) {
        return error(`Sorry, you don't own *${env}*. ${owner} does.`);
    },

    success: function (env) {
        return ok(`Success. *${env}* is now free.`);
    },

    success_all: function(envs) {
        if (envs.length == 0) return ok("You don't own any envs at the moment.");
        if (envs.length == 1)
            return Release.success(envs[0]);
        envs = envs.sort();
        return ok(`Success. *${envs.join('*, *')}* are now free`)
    }

};

var Status = {
    list: function (envs) {
        var attachments = envs.sort(function(a1, a2) {
            return a1.key > a2.key;
        }).map(function(e) {
            var color =  "good";
            var text = `*${e.key}* is available.`;
            if (e.taken) {
                color = "warn";
                var date = moment(e.taken).format('YYYY-MM-DD');
                text = `*${e.key}* is taken by ${e.owner} on ${date}`;
            }
            return {
                mrkdwn_in: ["text"],
                color: color,
                text: text
            }
        });
        return base(attachments);
    }
};

var Error = {
    not_found: function (env) {
        return error(`*${env}* is not found`)
    },

    not_enough_params: function () {
        return error("Not enough params. See usage.");
    },

    unknown_command: function (command) {
        return error(`Unknown command '${command}'. See usage.`);
    },
    
    banned: function () {
        return error("Sorry, you're not allowed to add or remove envs.");
    }


};

var help = function(helptext) {
    return helptext;
};

var Response = {
    error: Error,
    add: Add,
    take: Take,
    release: Release,
    status: Status,
    help: help
};

module.exports = Response;