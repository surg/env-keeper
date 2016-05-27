var storage = require('./storage.js');

function add(ctx) {
    return storage.get(ctx.env).then(function (env) {
        if (env != null) return status(ctx);
        var blacklist = process.env.ADD_BLACKLIST;
        if (blacklist && blacklist.indexOf(ctx.user) >= 0)
            return new Promise(function(r) {r('env_add_banned')});
        return storage.add(ctx.env).then(function() {return 'env_add_success';});
    });
}

function take(ctx) {
    return storage.get(ctx.env).then(function (owner) {
        if (owner == null) return 'env_not_found';
        if (owner == ctx.user)
            return 'already_own';
        if (owner != '') {
            ctx.owner = owner;
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

function status(ctx) {
    return storage.get(ctx.env).then(function (owner) {
        if (owner == null) return 'env_not_found';
        if (owner == '') return 'env_status_free';
        ctx.owner = owner;
        return 'env_status_taken';
    });
}

var Main = {
    authorize: function (token) {
        return token == process.env.TOKEN;
    },

    process: function (ctx) {
        if (!ctx.command || !ctx.env)
            return new Promise(function(r) {r('not_enough_params')});
        switch (ctx.command) {
            case 'add':
                return add(ctx);
            case 'take':
                return take(ctx);
            case 'release':
                return release(ctx);
            case 'status':
                return status(ctx);
        }
        return new Promise(function(r) {r('unknown_command')});
    }
};

module.exports = Main;


