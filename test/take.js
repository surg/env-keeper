var supertest = require("supertest");
var should = require("should");
var Promise = require("bluebird");
var storage = require("../app/storage.js");

// This agent refers to PORT where program is runninng.
var server = supertest.agent("http://localhost:3000");

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

describe("Take env suite", function () {
    before(function (done) {
        storage.add('test-take-a').then(function () {
            done()
        });
    });

    it("No params", function (done) {
        run(done, 'take', {
            "attachments": [{
                "color": "danger",
                "mrkdwn_in": ["text"],
                "text": "Not enough params. See usage."
            }],
            "response_type": "ephemeral"
        })
    });

    it("Take an env", function (done) {
        run(done, 'take test-take-a', {
            "response_type": "ephemeral",
            "attachments": [{"mrkdwn_in": ["text"], "color": "good", "text": "*test-take-a* is now taken by test."}]
        });
    });

    it("Env is taken by user", function (done) {
        run(function(){}, 'take test-take-a');
        run(done, 'take test-take-a', {
            "response_type": "ephemeral",
            "attachments": [{"mrkdwn_in": ["text"], "color": "warning", "text": "you already own *test-take-a*."}]
        });
    });

    it("Env is taken by someone else", function (done) {
        run(function(){}, 'take test-take-a');
        run(done, 'take test-take-a', {
            "response_type": "ephemeral",
            "attachments": [{"mrkdwn_in": ["text"], "color": "warning",
                "text": "Sorry, *test-take-a* is already taken by test. They must release it first."}]
        }, {user: 'test2'});
    });

    it("Seize the env", function (done) {
        run(function(){}, 'take test-take-a');
        run(done, 'seize test-take-a', {
            "response_type": "in_channel",
            "attachments": [{"mrkdwn_in": ["text"], "color": "good",
                "text": "test-take-a was seized from @test by test2"}]
        }, {user: 'test2'});
    });


    after(function (done) {
        Promise.all([
            storage.remove('test-take-a'),
            storage.remove('test-take-b')
        ]).then(function () {
            done()
        });

    });

})
;