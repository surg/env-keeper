var storage = require('./storage.js');

function add(ctx) {
    return storage.get(ctx.env).then(function (env) {
        if (env != null) return 'env_exists'; // TODO: return status, e.g. env_exists_free and env_exists_taken
        storage.add(ctx.env);
        return 'env_add_success';
    });

}

function take(ctx) {
    return storage.get(ctx.env).then(function (owner) {
        if (owner == null) return 'env_not_found';
        if (owner == ctx.user)
            return 'already_own';
        if (owner != '') {
            ctx.owner = env;
            return 'env_taken';
        }
        return storage.set(ctx.env, ctx.user).then(function () {
            return 'env_take_success';
        });
    });
}

function release(ctx) {
    return storage.get(ctx.env).then(function (owner) {
        if (owner == null) return 'env_not_found';
        if (owner == '') return 'env_already_free';
        if (owner != ctx.user) {
            ctx.owner = owner;
            return 'env_not_yours';
        }
        return storage.set(ctx.env, '').then(function () {
            return 'env_release_success';
        });
    });
}


var Main = {
    authorize: function (token) {
        return token == process.env.TOKEN;
    },

    process: function (ctx) {
        if (!ctx.command || !ctx.env)
            return 'not_enough_params';
        switch (ctx.command) {
            case 'add':
                return add(ctx);
            case 'take':
                return take(ctx);
            case 'release':
                return release(ctx);
        }
        return 'unknown_command';
    }
};

module.exports = Main;


