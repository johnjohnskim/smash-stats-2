var pg = require('pg');
var async = require('async');

var conn = require('./auth').db;

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

sql.getMany = function(queryDict, args, callback) {
  var queries = [];
  for (var k in queryDict) {
    queries.unshift(queryDict[k])
    queryDict[k] = function(cb) {
      // the arguments in sql.getRows do NOT reference the varibles during the loop
      //    i.e. if we use queryDict[k], we'll always use the last value of k,
      //    rather than the value during the loop. Instead, we know that
      //    async.parallel calls the functions sequentially and deterministically,
      //    so we can just reference the same array
      sql.getRows(queries.pop(), args, function(err, rows) {
        cb(null, rows);
      });
    }
  }
  async.parallel(queryDict, callback);
}

module.exports = sql;
