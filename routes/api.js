var express = require('express');
var bodyParser = require('body-parser');

var sql = require('../db/sql');
var router = express.Router();

router.use(function(req, res, next) {
  console.log('api request made');
  next();
});

// PLAYERS
router.route('/players')
  .get(function(req, res) {
    sql.getRows("SELECT * FROM players", null, res, function(err, rows) {
      res.json(rows);
    });
  })
  .post(function(req, res) {
    var name = req.body.name;
    if (!name) {
      return res.end('Need a name');
    }
    sql.insert("INSERT INTO u_players (name) VALUES ($1)", [req.body.name], res, function(err, id) {
      res.json(id);
    });
  })

router.route('/players/:pid')
  .get(function(req, res) {
    sql.getRow("SELECT * FROM players WHERE id=$1", [req.params.pid], res, function(err, row) {
      res.json(row);
    });
  })
  .put(function(req, res) {
    var name = req.body.name;
    if (!name) {
      return res.end('Need a name');
    }
    sql.query("UPDATE u_players SET name=$1 WHERE id=$2", [req.body.name, req.params.pid], res, function(err) {
      res.end('ok');
    });
  })

// FIGHTS
var fightFields = {
  p1: 'player1', p2: 'player2', p3: 'player3', p4: 'player4',
  c1: 'character1', c2: 'character2', c3: 'character3', c4: 'character4',
  stage: 'stage', winner: 'winner', notes: 'notes'
};
router.route('/fights')
  .get(function(req, res) {
    sql.getRows("SELECT id, to_char(date, 'YYYY-MM-DD') as date, stagename, winnername, p1name, c1name, p2name, c2name, p3name, c3name, p4name, c4name FROM fights", null, res, function(err, rows) {
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
    sql.insert("INSERT INTO u_fights " + fieldStr + " VALUES " + argStr, args, res, function(err, id) {
        res.json(id);
    });
  })

router.route('/fights/:fid')
  .get(function(req, res) {
    sql.getRow("SELECT * FROM fights WHERE id=$1", [req.params.fid], res, function(err, row) {
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
    sql.query("UPDATE u_fights SET "+field+"=$1 WHERE id=$2", [value, req.params.fid], res, function(err) {
      res.end('ok');
    });
  })

// REST
var views = ['stages', 'stagemeta', 'stagewins',
  'characters', 'characterwins', 'charactermeta', 'charactervs',
  'playermeta', 'playervs', 'playertimeline', 'charactertimeline'];

views.forEach(function(v) {
  router.route('/' + v)
    .get(function(req, res) {
      extra = v == 'playertimeline' ? " ORDER BY player, date" : '';
      sql.getRows("SELECT * FROM " + v + extra, null, res, function(err, rows) {
        res.json(rows);
      });
    })
});

module.exports = router;
