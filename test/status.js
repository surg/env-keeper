var supertest = require("supertest");
var should = require("should");
var Promise = require("bluebird");
var storage = require("../app/storage.js");
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

describe("Status suite", function () {
    beforeEach(function (done) {
        Promise.all(
            [storage.add('test-status-a'),
            storage.add('test-status-b1')]
        ).then(function () {
            done()
        });
    });

    it("Status single free", function (done) {
        run(done, 'status test-status-a', response.status.list([{key: 'test-status-a'}]));
    });

    it("Status single taken", function (done) {
        runAsync('take test-status-b1').then(function () {
            run(done, 'status test-status-b1', response.status.list([{key: 'test-status-b1', val: 'test'}]));
        });
    });

    it("Status partial", function (done) {
        runAsync('take test-status-b1').then(function () {
            run(done, 'status test',
                response.status.list([
                    {key: 'test-status-b1', val: 'test'},
                    {key: 'test-status-a'}]));
        });
    });

    it("Free?", function (done) {
        runAsync('take test-status-b1').then(function () {
            run(done, 'free? test', response.status.list([{key: 'test-status-a'}]));
        });
    });


    afterEach(function (done) {
        Promise.all([
            storage.remove('test-status-a'),
            storage.remove('test-status-b1'),
            storage.remove('test-status-b2')
        ]).then(function () {
            done()
        });

    });

})
;