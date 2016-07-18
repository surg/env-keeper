var storage = require("../app/storage.js");
var response = require("../app/response.js");
var util = require("./util.js");
var runAsync = util.runAsync;
var run = util.run;

describe("Status suite", function () {
    before(function(done) {
        util.setup();
        done();
    });

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

    after(function() {
        util.teardown();
    })
})
;