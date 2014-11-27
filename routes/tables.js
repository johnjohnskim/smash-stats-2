var express = require('express');
var router = express.Router();

var tablePages = require('./table-pages');

router.get('/:type', function(req, res) {
  var title;
  tablePages.forEach(function(t) {
    if (t[0] == req.params.type) {
      title = t[1];
    }
  });
  if (title) {
    res.render('tables', { title: title, type: req.params.type });
  } else {
    res.render('tables', { title: 'Page Not Found' });
  }
});

module.exports = router;
