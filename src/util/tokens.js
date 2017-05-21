var jwt = require('jsonwebtoken');
var mysql = require('mysql');
var extend = require('lodash').assign;

module.exports = function(mysql_config) {
  var salts = {};

  function getSalt(token, cb) {
    var connection = mysql.createConnection(mysql_config);

    connection.query("SELECT * FROM `salts` WHERE `token` = " + connection.escape(token) + " ;", function(err, rows) {
      connection.end();
      if (err) return console.error(err)

      cb(err, rows && rows[0] ? rows[0].salt : null);
    });
  }

  function insertSalt(salt, token, cb) {
    var connection = mysql.createConnection(mysql_config);

    connection.query("INSERT INTO `salts` SET ?;", [{'salt': salt, 'token': token}], function(err, data) {
      connection.end();
      cb(err, data);
    });
  }

  function deleteSalt(salt, cb) {
    var connection = mysql.createConnection(mysql_config);

    connection.query("DELETE FROM `salts` WHERE `salt` = " + connection.escape(salt) + " ;", function(err, rows) {
      connection.end();

      console.log("deleted salt", salt)
      if (cb) {
        cb(err, rows[0] ? rows[0].salt : null);
      }
    });
  }

  function decodeToken(token, cb) {
    if (!salts[token])  {
      getSalt(token, function(err, salt) {
        if (err) return cb({ "err": err });
        if (!salt) return cb({ "err": "Could not locate salt" });

        cb(null, decode(salt));
      });
    } else {
      cb(null, decode(salts[token].salt));
    }

    function decode(salt) {
      var decoded;

      try {
        decoded = jwt.verify(token, salt);
      } catch(err) {
        if (salts[token]) delete salts[token];

        deleteSalt(salt);

        return { "err": err };
      }

      return decoded;
    }
  }

  function createToken(data) {
    var salt =  Math.random().toString(36).substring(7);
    var token = jwt.sign(data, salt, { expiresIn: "1 day" });

    salts[token] = {
      salt: salt
    }

    insertSalt(salt, token, function(err, data) {
      if (err) console.error({'err': err});

      console.log("inserted salt with id", data.insertId);
    })

    return token;
  }

  (function createSchema(config) {
    var database = config.database;

    var connection = mysql.createConnection(extend({
      multipleStatements: true
    }, config));

    connection.query(
      'USE `'+ database +'`; ' +
      'CREATE TABLE IF NOT EXISTS `'+ database +'`.`salts` ( ' +
      '`id` INT UNSIGNED NOT NULL AUTO_INCREMENT, ' +
      '`token` VARCHAR(255) NULL, ' +
      '`salt` VARCHAR(36) NULL, ' +
      'PRIMARY KEY (`id`));',
      function(err, rows) {
        if (err) throw err;
        console.log('Successfully created salts table');
        connection.end();
      }
    );
  })(mysql_config);

  return {
    decodeToken: decodeToken,
    createToken: createToken
  }
}
