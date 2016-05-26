var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Env keeper'});
    console.log(req.params);
});

router.post('/webhook', function (req, res) {
    console.log(req.params);
});

module.exports = router;
