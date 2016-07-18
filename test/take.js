var storage = require("../app/storage.js");
var util = require("./util.js");
var run = util.run;

describe("Take env suite", function () {
    before(function (done) {
        util.setup();
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

    it("Not found", function (done) {
        run(done, 'take non-existent', {
            "response_type": "ephemeral",
            "attachments": [{
                "mrkdwn_in": ["text"], "color": "danger",
                "text": "*non-existent* is not found"
            }]
        });
    });


    after(function (done) {
        util.teardown();
        Promise.all([
            storage.remove('test-take-a'),
        ]).then(function () {
            done()
        });

    });

})
;