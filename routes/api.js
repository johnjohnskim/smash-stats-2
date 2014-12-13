var express = require('express');

var router = express.Router();
var sql = require('../db/sql');

router.use(function(req, res, next) {
  console.log('api request made');
  // authorize requests
  if (process.env.NODE_ENV !== 'development') {
    if (!req.session.username) {
      return res.end('access restricted');
    } else if (req.session.username !== 'quovo' && req.method !== 'GET') {
      return res.end('access restricted');
    }
  }
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
    var rating = req.body.rating;
    if (!name || !rating) {
      return res.end('Need a name and rating');
    }
    sql.insert("INSERT INTO u_players (name, rating) VALUES ($1, $2)", [name, rating], function(err, id) {
      res.json(id);
    });
  })

router.route('/players/:pid')
  .get(function(req, res) {
    sql.getRow("SELECT * FROM players WHERE id=$1", [req.params.pid], function(err, row) {
      if (!row) {
        return res.end('');
      }
      res.json(row);
    });
  })

// FIGHTS
var fightFields = [
   'player1', 'player2', 'character1', 'character2',
   'stage', 'winner', 'rating1', 'rating2', 'notes'
  ];
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
    var fieldStr = '(' + fightFields.map(function(f) { return f; }).join(',') + ')';
    var args = fightFields.map(function(a) { return req.body[a]; });
    var argStr = '(' + fightFields.map(function(a, i) { return '$' + (i+1); }).join(',') + ')';
    sql.insert("INSERT INTO u_fights " + fieldStr + " VALUES " + argStr, args, function(err, id) {
      res.json(id);
    });
  })

router.route('/fights/:id')
  .get(function(req, res) {
    sql.getRow("SELECT * FROM fights WHERE id=$1", [req.params.id], function(err, row) {
      if (!row) {
        return res.end('');
      }
      res.json(row);
    });
  })
  .put(function(req, res) {
    var field;
    var value;
    fightFields.forEach(function(f) {
      if (req.body[f]) {
        field = f;
        value = req.body[f];
      }
    });
    if (!field) {
      return res.end('invalid field');
    }
    sql.query("UPDATE u_fights SET "+field+"=$1 WHERE id=$2", [value, req.params.id], function(err) {
      res.end('ok');
    });
  })

// Other selectable views
var views = ['events', 'stages', 'stagemeta', 'stagewins',
  'characters', 'charactermeta', 'characterwins', 'charactervs',
  'playermeta', 'playervs', 'playertimeline', 'charactertimeline',
  'ratingtimeline'];

views.forEach(function(v) {
  router.route('/' + v)
    .get(function(req, res) {
      orderBy = v == 'playertimeline' ? " ORDER BY player, date" :
                v == 'charactertimeline' ? " ORDER BY character,date" :
                '';
      sql.getRows("SELECT * FROM " + v + orderBy, null, function(err, rows) {
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

router.route('/characterfights')
  .get(function(req, res) {
    sql.getRows("SELECT c.*, m.wins, m.total, m.winpct FROM characters c JOIN charactermeta m ON m.name=c.name",
      null,
      function(err, rows) {
        res.json(rows);
      });
  })

router.route('/highlights')
  .get(function(req, res) {
    var queries = {
      topPlayers: "SELECT p.*, m.total, m.wins, m.winpct FROM players p \
        INNER JOIN playermeta m ON m.id=p.id \
        WHERE m.total>0 \
        ORDER BY p.rating DESC, m.total DESC \
        LIMIT 3",
      topChars: "SELECT * FROM charactermeta \
        WHERE total>0 \
        ORDER BY winpct DESC, total DESC \
        LIMIT 3",
      bottomChars: "SELECT * FROM charactermeta \
        WHERE total>0 \
        ORDER BY winpct, total DESC \
        LIMIT 3",
      topStages: "SELECT * FROM stagemeta \
        WHERE total>0 \
        ORDER BY ratingchange DESC \
        LIMIT 3"
    };
    sql.getMany(queries, null, function(err, results) {
      res.json(results);
    });
  })

router.route('/highlights/players/:id')
  .get(function(req, res) {
    var queries = {
      topPlayers: "SELECT * FROM playervs v \
            WHERE v.player1=$1 AND total>0 \
            ORDER BY winpct DESC, total DESC \
            LIMIT 2",
      bottomPlayers: "SELECT * FROM playervs v \
            WHERE v.player1=$1 AND total>0 \
            ORDER BY winpct, total DESC \
            LIMIT 2",
      topChars: "SELECT * FROM characterwins w \
            WHERE w.player=$1 AND total>0 \
            ORDER BY winpct DESC, total DESC \
            LIMIT 3",
      bottomChars: "SELECT * FROM characterwins w \
            WHERE w.player=$1 AND total>0 \
            ORDER BY winpct, total DESC \
            LIMIT 3",
      topStages: "SELECT * FROM stagewins w \
            WHERE w.player=$1 AND total>0 \
            ORDER BY winpct DESC, total DESC \
            LIMIT 2",
      bottomStages: "SELECT * FROM stagewins w \
            WHERE w.player=$1 AND total>0 \
            ORDER BY winpct, total DESC \
            LIMIT 2"
    };
    sql.getMany(queries, [req.params.id], function(err, results) {
      res.json(results);
    });
  })

router.route('/highlights/characters/:id')
  .get(function(req, res) {
    var queries = {
      topPlayers: "SELECT * FROM characterwins w \
        WHERE w.character=$1 AND total>0 \
        ORDER BY winpct DESC, total DESC \
        LIMIT 3",
      topChars: "SELECT * FROM charactervs v \
        WHERE v.character1=$1 AND total>0 \
        ORDER BY winpct DESC, total DESC \
        LIMIT 3",
      bottomChars: "SELECT * FROM charactervs v \
        WHERE v.character1=$1 AND total>0 \
        ORDER BY winpct, total DESC \
        LIMIT 3",
      topStages: "SELECT * FROM charstagewins w \
        WHERE w.character=$1 AND total>0 \
        ORDER BY winpct DESC, total DESC \
        LIMIT 2",
      bottomStages: "SELECT * FROM charstagewins w \
        WHERE w.character=$1 AND total>0 \
        ORDER BY winpct, total DESC \
        LIMIT 2"
    };
    sql.getMany(queries, [req.params.id], function(err, results) {
      res.json(results);
    });
  })

module.exports = router;
