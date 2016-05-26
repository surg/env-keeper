var storage = require('./storage.js');

function take(name, user) {
    var env = storage.get(name);
    if (env == null) return 'env_not_found: ' + name;
    if (env == user)
        return 'You already own this env.';
    if (env != '')
        return 'Sorry, env ' + name + ' is already taken by ' + env + '. They must release it first.';
    storage.take(name, user);
    return 'Success. Env ' + name + ' is now taken by ' + user;
}

function release(name, user) {
    var env = storage.get(name);
    if (env == null) return 'env_not_found: ' + name;
    if (env == '') return 'Env ' + name + ' is free';
    if (env != user) {
        return "Sorry, you don't own the env. " + env + " does";
    }
    storage.take(name, '');
    return 'Success. Env ' + name + ' is now free';
}

function add(name) {
    var env = storage.get(name);
    if (env != null) return 'env_exists: ' + name;
    storage.add(name);
    return 'Env ' + name + ' is successfully added';
}


var Main = {
    authorize: function (token) {
        return token == process.env.TOKEN;
    },

    process: function(text, user) {
        var parts = text.split(' ');
        if (parts.length < 2)
            return 'not_enough_params';
        switch(parts[0]) {
            case 'take':
                return take(parts[1], user);
            case 'add':
                return add(parts[1]);
            case 'release':
                return release(parts[1], user);
        }

        return 'unknown_command';
    }
};


module.exports = Main;


