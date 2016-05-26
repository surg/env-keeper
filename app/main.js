var storage = require('./storage.js');

function take(ctx) {
    var env = storage.get(ctx.env);
    if (env == null) return 'env_not_found';
    if (env == ctx.user)
        return 'already_own';
    if (env != '') {
        ctx.owner = env;
        return 'env_taken';
    }
    storage.take(ctx.env, ctx.user);
    return 'env_take_success';
}

function release(ctx) {
    var env = storage.get(ctx.env);
    if (env == null) return 'env_not_found';
    if (env == '') return 'env_already_free';
    if (env != ctx.user) {
        ctx.owner = env;
        return 'env_not_yours';
    }
    storage.take(ctx.env, '');
    return 'env_release_success';
}

function add(ctx) {
    var env = storage.get(ctx.env);
    if (env != null) return 'env_exists'; // TODO: return status, e.g. env_exists_free and env_exists_taken
    storage.add(ctx.env);
    return 'env_add_success';
}


var Main = {
    authorize: function (token) {
        return token == process.env.TOKEN;
    },

    process: function(ctx) {
        if (!ctx.command || !ctx.env)
            return 'not_enough_params';
        switch(ctx.command) {
            case 'take':
                return take(ctx);
            case 'add':
                return add(ctx);
            case 'release':
                return release(ctx);
        }
        return 'unknown_command';
    }
};


module.exports = Main;


