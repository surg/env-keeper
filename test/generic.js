var response = require("../app/response.js");
var util = require("./util.js");
var run = util.run;

describe("Generic suite", function () {

    it("Unknown command", function (done) {
        var command = 'asdfasdfas';
        run(done, command, response.error.unknown_command(command));
    });

})
;