var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('react-app', { title: '', view: 'fights', isTesting: process.env.NODE_ENV == 'development' });
});

module.exports = router;
