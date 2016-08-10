var response = require("../app/response.js");
var util = require("./util.js");
var run = util.run;
var should = require("should");

describe("Generic suite", function () {
    before(function(done) {
        util.setup();
        done();
    });

    it("Unknown command", function (done) {
        var command = 'asdfasdfas';
        run(done, command, response.error.unknown_command(command));
    });

    it("Unknown token", function (done) {
        run(function(err, res) {
            res.status.should.equal(403);
            done();
        }, 'status', null, {token: 'wrong'});
    });
    
    after(function (done) {
        util.teardown();
        done();
    });
})
;