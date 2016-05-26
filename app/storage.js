var Promise = require('bluebird');
var inmemory = {};
var InMemoryStorage = {
    get: function(name) {
        return new Promise(function(resolve) { resolve(inmemory[name])});
    },

    set: function(env, user) {
        return new Promise(function(resolve) {
            inmemory[env] = user;
            resolve();
        });
    },

    add: function(env) {
        return this.set(env, '');
    }
};

// Redis

var redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var client = redis.createClient(process.env.REDIS_HOST, process.env.REDIS_PORT);

var RedisStorage = {
    get: function(name) {
        // client.
    },

    set: function(env, user) {
        return new Promise(function(resolve) {
            inmemory[env] = user;
            resolve();
        });
    },

    add: function(env) {
        return this.set(env, '');
    }
};


module.exports = InMemoryStorage;