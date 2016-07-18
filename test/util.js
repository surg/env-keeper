var supertest = require("supertest");
var should = require("should");
var Promise = require("bluebird");
var client = supertest.agent("http://localhost:3000");
var app = require("../app");
var server = null;

var Util = {
    setup: function() {
        process.env.TOKEN = 'token';
        server = app.listen("3000");
    },

    teardown: function() {
        server.close();
    },

    runAsync: function (text, params) {
        return new Promise(function (resolve) {
            Util.run(resolve, text, null, params);
        });
    },

    run: function (done, text, expected, params) {
        params = params || {};
        var user = params['user'] || 'test';
        client
            .post("/webhook")
            .send({token: 'token', user_name: user, text: text})
            .expect("Content-type", /json/)
            .expect(200)
            .end(function (err, res) {
                if (expected)
                    JSON.parse(res.text).should.deepEqual(expected);
                done();
            });
    }

};

module.exports = Util;