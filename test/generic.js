var supertest = require("supertest");
var should = require("should");
var Promise = require("bluebird");
var response = require("../app/response.js");

// This agent refers to PORT where program is running.
var server = supertest.agent("http://localhost:3000");

function runAsync(text, params) {
    return new Promise(function (resolve) {
        run(resolve, text, null, params);
    });
}

function run(done, text, expected, params) {
    params = params || {};
    var user = params['user'] || 'test';
    server
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

describe("Generic suite", function () {

    it("Unknown command", function (done) {
        var command = 'asdfasdfas';
        run(done, command, response.error.unknown_command(command));
    });

})
;