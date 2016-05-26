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

var redis = Promise.promisifyAll(require('redis'));
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var client = redis.createClient(process.env.REDIS_URL, {prefix: 'env:'});

var RedisStorage = {
    get: function(name) {
        return client.getAsync(name);
    },

    set: function(env, user) {
        return client.setAsync(env, user);
    },

    add: function(env) {
        return this.set(env, '');
    }
};


module.exports = RedisStorage;