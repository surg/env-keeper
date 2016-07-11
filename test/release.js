var supertest = require("supertest");
var should = require("should");
var Promise = require("bluebird");
var storage = require("../app/storage.js");

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

describe("Release env suite", function () {
    before(function (done) {
        storage.add('test-release-a').then(function () {
            done()
        });
    });

    it("Success", function (done) {
        runAsync('take test-release-a').then(function () {
            run(done, 'release test-release-a', {
                "response_type": "ephemeral",
                "attachments": [{
                    "mrkdwn_in": ["text"],
                    "color": "good",
                    "text": "Success. *test-release-a* is now free."
                }]
            })
        });
    });

    it("Free env", function (done) {
        run(done, 'release test-release-a', {
            "response_type": "ephemeral",
            "attachments": [{
                "mrkdwn_in": ["text"],
                "color": "good",
                "text": "*test-release-a* is not taken by anyone."
            }]
        });
    });

    it("Taken env", function (done) {
        runAsync('take test-release-a', {user: 'other'}).then(function () {
            run(done, 'release test-release-a', {
                "response_type": "ephemeral",
                "attachments": [{
                    "mrkdwn_in": ["text"], "color": "danger",
                    "text": "Sorry, you don\'t own *test-release-a*. other does."
                }]
            })
        });
    });

    it("Multiple envs", function (done) {
        Promise.all([
            runAsync('add test-release-b'),
            runAsync('add test-release-c')
        ]).then(function () {
                return Promise.all([
                    runAsync('seize test-release-b'),
                    runAsync('seize test-release-c')
                ]);
            })
            .then(function () {
                run(done, 'release', {
                    "response_type": "ephemeral",
                    "attachments": [{
                        "mrkdwn_in": ["text"], "color": "good",
                        "text": "Success. *test-release-c*, *test-release-b* are now free"
                    }]
                })
            });
    });

    it("No envs", function (done) {
        runAsync('release').then(function () {
            run(done, 'release', {
                "response_type": "ephemeral",
                "attachments": [{
                    "mrkdwn_in": ["text"], "color": "good",
                    "text": "You don\'t own any envs at the moment."
                }]
            })
        });
    });

    it("Not found", function (done) {
        run(done, 'release non-existent', {
            "response_type": "ephemeral",
            "attachments": [{
                "mrkdwn_in": ["text"], "color": "danger",
                "text": "*non-existent* is not found"
            }]
        });
    });


    after(function (done) {
        Promise.all([
            storage.remove('test-release-a'),
            storage.remove('test-release-b'),
            storage.remove('test-release-c')
        ]).then(function () {
            done()
        });

    });

})
;