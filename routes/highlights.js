var express = require('express');
var router = express.Router();

router.get('/*', function(req, res) {
  res.render('react-app', { title: 'Highlights', view: 'highlights', isTesting: process.env.NODE_ENV == 'development' });
});

module.exports = router;
