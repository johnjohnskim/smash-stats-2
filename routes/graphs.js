var express = require('express');
var path = require('path');

var router = express.Router();

router.get('/', function(req, res) {
  res.render('graphs', { title: 'Player Timeline', type: 'player' });
});
router.get('/players', function(req, res) {
  res.render('graphs', { title: 'Player Timeline', type: 'player' });
});
router.get('/characters', function(req, res) {
  res.render('graphs', { title: 'Character Timeline', type: 'character' });
});

module.exports = router;
