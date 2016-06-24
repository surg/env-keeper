var express = require('express');
var main = require('../app/main.js');
var context = require('../app/context');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'env_keeper'});

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Env keeper'});
});

router.post('/webhook', function (req, res) {
    var body = req.body;
    if (!main.authorize(body.token)) {
        res.statusCode = 403;
        res.send('Not Authorized');
    } else {
        var ctx = context(body);
        var respond = function(result) {
            res.contentType('application/json');
            res.json(result);
        };
        var respond_err = function(result) {
            log.error(result);
            respond(result);
        };
        main.process(ctx).then(respond, respond_err);
    }

});

module.exports = router;
