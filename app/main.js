var Promise = require('bluebird');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'env_keeper'});
var storage = require('./storage.js');
var fs = Promise.promisifyAll(require('fs'));
var r = require('./response.js');


function validatePresent(value) {
    return value ? Promise.resolve(value) : Promise.reject(r.error.not_enough_params());
}

function add(ctx) {
    return validatePresent(ctx.env).then(storage.get).then(function (env) {
        if (env != null) return bulkstatus(ctx);

        // Check if the guy is banned.
        var blacklist = process.env.ADD_BLACKLIST;
        if (blacklist && blacklist.indexOf(ctx.user) >= 0) {
            log.info(ctx, "Blacklisted user tried to add env");
            return Promise.resolve(r.add.banned());
        }

        // Check name format
        var regex = /^[A-Za-z-_0-9]+$/;
        if (!regex.test(ctx.env)) {
            log.info(ctx, "Env name format violation");
            return Promise.resolve(r.add.invalid_name(regex));
        }
        log.info(ctx, "Env added");
        return storage.add(ctx.env).return(r.add.success(ctx.env));
    });
}

function take(ctx) {
    return validatePresent(ctx.env).then(storage.get).then(function (owner) {
        if (owner == null) return r.error.not_found(ctx.env);
        if (owner == ctx.user)
            return r.take.already_own(ctx.env);
        if (owner != '') {
            return r.take.taken(ctx.env, owner);
        }
        return storage.set(ctx.env, ctx.user).return(r.take.success(ctx.env, ctx.user));
    });
}

function release(ctx) {
    return validatePresent(ctx.env).then(storage.get).then(function (owner) {
        if (owner == null) return r.error.not_found(ctx.env);
        if (owner == '') return r.release.already_free(ctx.env);
        if (owner != ctx.user) {
            return r.release.not_yours(ctx.env, owner);
        }
        return storage.set(ctx.env, '').return(r.release.success(ctx.env))
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

var admin_commands = {'add': add};
var commands = {
    'take': take,
    'release': release,
    'status': bulkstatus,
    'free?': free,
    'help': help
};

var Main = {
    authorize: function (token) {
        return token == process.env.TOKEN;
    },

    process: function (ctx) {
        var command = admin_commands[ctx.command] || commands[ctx.command];
        if (!command)
            return Promise.resolve('unknown_command');
        return command(ctx);
    }
};

module.exports = Main;


