var storage = require("../app/storage.js");
var util = require("./util.js");
var runAsync = util.runAsync;
var run = util.run;


describe("Release env suite", function () {
    before(function (done) {
        util.setup();
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
                        "text": "Success. *test-release-b*, *test-release-c* are now free"
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
        util.teardown();
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