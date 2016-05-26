var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Env keeper'});
});

router.post('/webhook', function (req, res) {
    console.log(req);
    res.send('Hello, world');
});

module.exports = router;
