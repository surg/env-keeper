var Promise = require('bluebird');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'env_keeper'});
var storage = require('./storage.js');
var fs = Promise.promisifyAll(require('fs'));
var r = require('./response.js');


function validatePresent(value) {
    return value ? Promise.resolve(value) : Promise.reject(r.error.not_enough_params());
}

function validateAdminAccess(ctx) {
    // Check if the guy is banned.
    var blacklist = process.env.ADMIN_BLACKLIST;
    if (blacklist && blacklist.indexOf(ctx.user) >= 0) {
        log.info(ctx, "Blacklisted user tried to add env");
        return Promise.reject(r.error.banned());
    }
    return Promise.resolve(ctx);
}

function add(ctx) {
    return validateAdminAccess(ctx).return(validatePresent(ctx.env)).then(storage.get).then(function (env) {
        if (env != null) return bulkstatus(ctx);

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

function remove(ctx) {
    return validateAdminAccess(ctx).return(validatePresent(ctx.env)).then(storage.get).then(function (env) {
        if (env == null) return r.error.not_found(ctx.env);
        
        return storage.remove(env.key).return(r.remove.success(ctx.env));
    });
}


function take(ctx, seize) {
    return validatePresent(ctx.env).then(storage.get).then(function (env) {
        if (env == null) return r.error.not_found(ctx.env);
        if (env.owner == ctx.user)
            return r.take.already_own(ctx.env);
        var success_response = r.take.success(ctx.env, ctx.user); 
        if (env.owner != '') {
            if (!seize) return r.take.taken(ctx.env, env.owner);
            // Seizing the env
            log.info(ctx, "Env was seized");
            success_response = r.take.seized(ctx.env, env.owner, ctx.user);
        }
        return storage.take(ctx.env, ctx.user).return(success_response);
    });
}

function releaseOne(ctx) {
    return storage.get(ctx.env).then(function (env) {
        if (env == null) return r.error.not_found(ctx.env);
        if (!env.taken) return r.release.already_free(ctx.env);
        if (env.owner != ctx.user) {
            return r.release.not_yours(ctx.env, env.owner);
        }
        return storage.release(ctx.env).return(r.release.success(ctx.env))
    });
}

function releaseAll(ctx) {
    return storage.getall().filter(function(env) {
        return env.owner == ctx.user;
    }).each(function(env) {
        storage.release(env.key);
    }).map(function(env) {return env.key}).then(r.release.success_all);
}

function release(ctx) {
    return ctx.env ? releaseOne(ctx) : releaseAll(ctx);
}

function seize(ctx) {
    return take(ctx, true);
}

function bulkstatus(ctx) {
    return storage.getall(ctx.env).then(r.status.list);
}

function free(ctx) {
    return storage.getall(ctx.env).filter(function(env) {
        return !env.taken;
    }).then(r.status.list);
}

function help(ctx) {
    var url = 'https://github.com/surg/env-keeper/blob/master/usage.md';
    return Promise.resolve(r.help(`See ${url}`));
}

var admin_commands = {'add': add, 'remove': remove};
var commands = {
    'take': take,
    'release': release,
    'seize': seize,
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
            return Promise.resolve(r.error.unknown_command(ctx.command));
        log.info(ctx, "Command invoked");
        return command(ctx);
    }
};

module.exports = Main;


