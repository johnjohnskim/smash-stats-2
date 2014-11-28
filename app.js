var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var api = require('./routes/api');
var login = require('./routes/login');
var fights = require('./routes/fights');
var tables = require('./routes/tables');
var graphs = require('./routes/graphs');

var app = express();

// views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
  secret: 'melee is still king',
  resave: false,
  saveUninitialized: false
}));

// link up files
// static
app.use(express.static(path.join(__dirname, 'public')));
// compiled
app.use(express.static(path.join(__dirname, 'build')));
// libraries
app.use(express.static(path.join(__dirname, 'bower_components')));
// react testing
app.use(express.static(path.join(__dirname, 'react')));

// authorize requests
app.use(function(req, res, next) {
  if (app.get('env') !== 'development' && !req.session.username) {
    if (req.cookies.username) {
      req.session.username = req.cookies.username;
    } else if (req.url != '/login') {
      res.redirect('/login');
    }
  }
  next();
});

// routes
app.use('/', index);
app.use('/api', api);
app.use('/', login);
app.use('/fights', fights);
app.use('/tables', tables);
app.use('/graphs', graphs);

// 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// dev error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.end('Status: ' + err.status + '\n' + err.stack);
  });
}
// prod error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.end(err.message);
});

// module.exports = app;
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
