var express = require('express');
var main = require('../app/main.js');

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
        var result = main.process(body.text, body.user_name);
        res.send(result);
    }

});

module.exports = router;
