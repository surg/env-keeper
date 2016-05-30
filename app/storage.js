var Promise = require('bluebird');

var KEY_PREFIX = 'env:';
var redis = Promise.promisifyAll(require('redis'));
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var client = redis.createClient(process.env.REDIS_URL, {prefix: KEY_PREFIX});

var RedisStorage = {
    get: function(name) {
        return client.getAsync(name);
    },

    getall: function() {
        var keys = client.keysAsync(KEY_PREFIX + '*');

        return keys.map(function (k) {
            k = k.substr(KEY_PREFIX.length);
            return client.getAsync(k).then(function(v) {
                return {
                    key: k,
                    val: v
                }
            })
        });
    },

    set: function(env, user) {
        return client.setAsync(env, user);
    },

    add: function(env) {
        return this.set(env, '');
    }
};


module.exports = RedisStorage;