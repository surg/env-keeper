var Promise = require('bluebird');

var KEY_PREFIX = 'env:';
var redis = Promise.promisifyAll(require('redis'));
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var client = redis.createClient(process.env.REDIS_URL || "", {prefix: KEY_PREFIX});
var moment = require('moment');

var RedisStorage = {
    get: function(name) {
        return client.hgetallAsync(name);
    },

    getall: function(partialKey) {
        partialKey = partialKey || '';
        var keys = client.keysAsync(KEY_PREFIX + partialKey + '*');

        return keys.map(function (k) {
            k = k.substr(KEY_PREFIX.length);
            return client.hgetallAsync(k).then(function(obj) {
                obj.key = k;
                return obj;
            });
        });
    },

    take: function(key, owner) {
        return client.hmsetAsync(key, {taken: moment().format('YYYY-MM-DD'), owner: owner});
    },

    release: function(key) {
        return client.hmsetAsync(key, {taken: '', owner: ''});
    },

    add: function(env) {
        return this.release(env, {taken: ''});
    },

    remove: function(env) {
        return client.delAsync(env);
    }

};


module.exports = RedisStorage;