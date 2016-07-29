var storage = require("../app/storage.js");
var util = require("./util.js");
var run = util.run;

describe("Add env suite", function () {
    before(function (done) {
        storage.add('test-add-a').then(function () {
            util.setup();
            done()
        });
    });

    it("No params", function (done) {
        run(done, 'add', {
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
        run(done, 'add', {
            "attachments": [{
                "color": "danger",
                "mrkdwn_in": ["text"],
                "text": "Sorry, you\'re not allowed to add or remove envs."
            }],
            "response_type": "ephemeral"
        }, {user: 'banned'});
    });

    it("Add an env", function (done) {
        run(done, 'add test-add-b', {
            "response_type": "ephemeral",
            "attachments": [{"mrkdwn_in": ["text"], "color": "good", "text": "*test-add-b* is successfully added."}]
        });
    });

    it("Add existing env", function (done) {
        run(done, 'add test-add-a', {
            "response_type": "ephemeral",
            "attachments": [{
                "mrkdwn_in": ["text"], "color": "good", "text": "*test-add-a* is available."
            }]
        });
    });

    it("Invalid name", function (done) {
        run(done, 'add test-a&', {
            "attachments": [{
                "color": "warning",
                "mrkdwn_in": ["text"],
                "text": "Sorry, but the suggested name doesn't seem quite right. Try something that fits reqex /^[A-Za-z-_0-9]+$/"
            }
            ],
            "response_type": "ephemeral"
        });
    });

    after(function (done) {
        util.teardown();
        Promise.all([
            storage.remove('test-add-a'),
            storage.remove('test-add-b')
        ]).then(function () {
            done()
        });
    });

});