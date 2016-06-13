var Promise = require('bluebird');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'env_keeper'});
var storage = require('./storage.js');
var fs = Promise.promisifyAll(require('fs'));


function add(ctx) {
    return storage.get(ctx.env).then(function (env) {
        if (env != null) return status(ctx);

        // Check if the guy is banned.
        var blacklist = process.env.ADD_BLACKLIST;
        if (blacklist && blacklist.indexOf(ctx.user) >= 0) {
            log.info(ctx, "Blacklisted user tried to add env");
            return Promise.resolve('env_add_banned');
        }

        // Check name format
        var regex = /^[A-Za-z-_0-9]+$/;
        if (!regex.test(ctx.env)) {
            log.info(ctx, "Env name format violation");
            ctx.regex = regex;
            return Promise.resolve('env_add_invalid_name');
        }
        log.info(ctx, "Env added");
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

function prepstatus(ctx) {
    return function(envs) {
        envs.sort(function(a, b) { return a.key > b.key});
        ctx.envs = envs.slice(0, -1);
        ctx.last = envs[envs.length - 1];
        return 'env_status_all';
    };
}
function bulkstatus(ctx) {
    return storage.getall(ctx.env).then(prepstatus(ctx));
}

function free(ctx) {
    return storage.getall(ctx.env).filter(function(env) {
        return !env.val;
    }).then(prepstatus(ctx));
}

function help(ctx) {
    return fs.readFileAsync('usage.md').then(function(txt) {
        ctx.help = txt;
        return 'help';
    });
}

var Main = {
    authorize: function (token) {
        return token == process.env.TOKEN;
    },

    process: function (ctx) {
        var noparams_commands = ['status', 'help', 'free?'];
        if (!ctx.env && (!ctx.command || noparams_commands.indexOf(ctx.command) < 0)) {
            return Promise.resolve('not_enough_params');
        }

        switch (ctx.command) {
            case 'add':
                return add(ctx);
            case 'take':
                return take(ctx);
            case 'release':
                return release(ctx);
            case 'status':
                return bulkstatus(ctx);
            case 'free?':
                return free(ctx);
            case 'help':
                return help(ctx);
        }
        return Promise.resolve('unknown_command');
    }
};

module.exports = Main;


