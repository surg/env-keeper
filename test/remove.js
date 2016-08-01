var storage = require("../app/storage.js");
var util = require("./util.js");
var run = util.run;

describe("Remove env suite", function () {
    before(function (done) {
        storage.add('test-remove-a').then(function () {
            util.setup();
            done()
        });
    });

    it("No params", function (done) {
        run(done, 'remove', {
            "attachments": [{
                "color": "danger",
                "mrkdwn_in": ["text"],
                "text": "Not enough params. See usage."
            }],
            "response_type": "ephemeral"
        })
    });

    it("Blacklist", function(done) {
        process.env.ADMIN_BLACKLIST = 'banned';
        run(done, 'remove', {
            "attachments": [{
                "color": "danger",
                "mrkdwn_in": ["text"],
                "text": "Sorry, you\'re not allowed to add or remove envs."
            }],
            "response_type": "ephemeral"
        }, {user: 'banned'});
    });

    it("Remove an env", function (done) {
        run(done, 'remove test-remove-a', {
            "response_type": "ephemeral",
            "attachments": [{"mrkdwn_in": ["text"], "color": "good", "text": "*test-remove-a* is successfully removed."}]
        });
    });

    it("Remove non-existing env", function (done) {
        run(done, 'remove test-remove-nonexist', {
            "response_type": "ephemeral",
            "attachments": [{
                "mrkdwn_in": ["text"], "color": "danger", "text": "*test-remove-nonexist* is not found"
            }]
        });
    });

    after(function (done) {
        util.teardown();
        Promise.all([
            storage.remove('test-remove-a')
        ]).then(function () {
            done()
        });
    });

});