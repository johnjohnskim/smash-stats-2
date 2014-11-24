var express = require('express');
var bodyParser = require('body-parser');

var sql = require('../db/sql');
var router = express.Router();

router.use(function(req, res, next) {
  console.log('api request made');
  // special global var used by sql.js
  API_RESPONSE = res;
  next();
});

// PLAYERS
router.route('/players')
  .get(function(req, res) {
    sql.getRows("SELECT * FROM players", null, function(err, rows) {
      res.json(rows);
    });
  })
  .post(function(req, res) {
    var name = req.body.name;
    if (!name) {
      return res.end('Need a name');
    }
    sql.insert("INSERT INTO u_players (name) VALUES ($1)", [req.body.name], function(err, id) {
      res.json(id);
    });
  })

router.route('/players/:pid')
  .get(function(req, res) {
    sql.getRow("SELECT * FROM players WHERE id=$1", [req.params.pid], function(err, row) {
      res.json(row);
    });
  })

// FIGHTS
var fightFields = {
  p1: 'player1', p2: 'player2', c1: 'character1', c2: 'character2',
  stage: 'stage', winner: 'winner', rating: 'rating', notes: 'notes'
};
router.route('/fights')
  .get(function(req, res) {
    sql.getRows("SELECT * FROM fights", null, function(err, rows) {
      res.json(rows);
    });
  })
  .post(function(req, res) {
    if (!req.body.stage || !req.body.winner) {
      return res.end('Need a ' + (!req.body.stage ? 'stage' : 'winner'));
    }
    var fields = Object.keys(fightFields);
    var fieldStr = '(' + fields.map(function(f) { return fightFields[f]; }).join(',') + ')';
    var args = fields.map(function(a) { return req.body[a]; });
    var argStr = '(' + fields.map(function(a, i) { return '$' + (i+1); }).join(',') + ')';
    sql.insert("INSERT INTO u_fights " + fieldStr + " VALUES " + argStr, args, function(err, id) {
      res.json(id);
    });
  })

router.route('/fights/:fid')
  .get(function(req, res) {
    sql.getRow("SELECT * FROM fights WHERE id=$1", [req.params.fid], function(err, row) {
      res.json(row);
    });
  })
  .put(function(req, res) {
    var fields = Object.keys(fightFields);
    var field, value;
    fields.forEach(function(f) {
      if (req.body[f]) {
        field = fightFields[f];
        value = req.body[f];
      }
    });
    if (!field) {
      res.end('invalid field');
    }
    sql.query("UPDATE u_fights SET "+field+"=$1 WHERE id=$2", [value, req.params.fid], function(err) {
      res.end('ok');
    });
  })

// Other selectable views
var views = ['stages', 'stagemeta', 'stagewins',
  'characters', 'characterwins', 'charactermeta', 'charactervs',
  'playermeta', 'playervs', 'playertimeline', 'charactertimeline'];

views.forEach(function(v) {
  router.route('/' + v)
    .get(function(req, res) {
      extra = v == 'playertimeline' ? " ORDER BY player, date" : '';
      sql.getRows("SELECT * FROM " + v + extra, null, function(err, rows) {
        res.json(rows);
      });
    })
});

// Updateable views for ELO/rating
var ratingViews = ['players', 'stages', 'characters'];
ratingViews.forEach(function(v) {
  router.route('/' + v + '/:id')
    .put(function(req, res) {
      var rating = req.body.rating;
      if (!rating) {
        return res.end('Need a rating');
      }
      sql.query("UPDATE u_"+v+" SET rating=$1 WHERE id=$2", [rating, req.params.id], function(err) {
        res.end('ok');
      });
    })
});

module.exports = router;
