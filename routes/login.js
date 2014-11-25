var express = require('express');
var appPassword = require('../db/auth').app;
var guestPassword = require('../db/auth').guest;
var router = express.Router();

router.route('/login')
  .get(function(req, res) {
    if (req.session.username) {
      res.redirect('/');
    } else {
      res.render('login', { title: 'Smash Login' });
    }
  })
  .post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) {
      res.end('Missing a field');
    } else if (username == 'quovo' && password == appPassword) {
      req.session.username = 'quovo';
      res.cookie('username', 'quovo');
      res.redirect('/');
    } else if (username == 'guest' && password == guestPassword) {
      req.session.username = 'guest';
      res.redirect('/');
    } else {
      res.end('Invalid username or password');
    }
  })

module.exports = router;
