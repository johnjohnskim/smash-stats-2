var express = require('express');
var router = express.Router();

var tablePages = require('./table-pages');

router.get('/', function(req, res) {
  res.render('index', { title: 'Smash', tablePages: tablePages });
});

module.exports = router;
