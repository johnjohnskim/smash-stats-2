var pg = require('pg');
var conn = require('./auth');

var sql = {};

function makeQuery(query, args, callback) {
  if (!args || !args.length) { args = null; }
  pg.connect(conn, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    client.query(query, args, function(err, result) {
      done();
      // if error, override callback and end response
      if (err) {
        console.error('error running query', err);
        API_RESPONSE.end(err.message);
      } else {
        callback(err, result);
      }
    });
  });
}
sql.query = makeQuery;

sql.getRows = function(query, args, callback) {
  makeQuery(query, args, function(err, result) {
    callback(err, result.rows);
  });
};

sql.getRow = function(query, args, callback) {
  makeQuery(query, args, function(err, result) {
    callback(err, result.rows[0]);
  });
};


sql.insert = function(query, args, callback) {
  if (!query.match(/RETURNING/i)) {
    query += ' RETURNING id';
  }
  makeQuery(query, args, function(err, result) {
    callback(err, result.rows[0]);
  });
};

module.exports = sql;
