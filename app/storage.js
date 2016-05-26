var inmemory = {};
var Storage = {
    get: function(name) {
        return inmemory[name];
    },

    take: function(env, user) {
        inmemory[env] = user;
    },

    add: function(env) {
        inmemory[env] = '';
    }
};

module.exports = Storage;