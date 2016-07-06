var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.
var server = supertest.agent("http://localhost:3000");

describe("Env Keeper Suite",function(){
    before()
    it("Add an env",function(done) {

        // calling home page api
        server
            .post("/webhook")
            .send({token: 'token', user_name: 'test', text: 'add test-a'})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res) {

                done();
            });
    });

});