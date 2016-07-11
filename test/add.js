var supertest = require("supertest");
var should = require("should");
var Promise = require("bluebird");
var storage = require("../app/storage.js");

// This agent refers to PORT where program is runninng.
var server = supertest.agent("http://localhost:3000");

function run(text, expected, done) {
    server
        .post("/webhook")
        .send({token: 'token', user_name: 'test', text: text})
        .expect("Content-type", /json/)
        .expect(200)
        .end(function (err, res) {
            JSON.parse(res.text).should.deepEqual(expected);
            done();
        });
}

describe("Add env suite", function () {
    before(function (done) {
        storage.add('test-add-a').then(function () {
            done()
        });
    });

    it("No params", function (done) {
        run('add',
            {
                "attachments": [{
                    "color": "danger",
                    "mrkdwn_in": ["text"],
                    "text": "Not enough params. See usage."
                }],
                "response_type": "ephemeral"
            },
            done)
    });

    // TODO: Test blacklist

    it("Add an env", function (done) {
        run('add test-add-b',
            {
                "response_type": "ephemeral",
                "attachments": [{"mrkdwn_in": ["text"], "color": "good", "text": "*test-add-b* is successfully added."}]
            },
            done);
    });

    it("Add existing env", function (done) {
        run('add test-add-a',
            {
                "response_type": "ephemeral",
                "attachments": [{
                    "mrkdwn_in": ["text"], "color": "good", "text": "*test-add-a* is available."
                }]
            },
            done);
    });

    it("Invalid name", function (done) {
        run('add test-a&',
            {
                "attachments": [{
                    "color": "warning",
                    "mrkdwn_in": ["text"],
                    "text": "Sorry, but the suggested name doesn't seem quite right. Try something that fits reqex /^[A-Za-z-_0-9]+$/"
                }
                ],
                "response_type": "ephemeral"
            },
            done);
    });

    after(function (done) {
        Promise.all([
            storage.remove('test-add-a'),
            storage.remove('test-add-b')
        ]).then(function () {
            done()
        });

    });

})
;