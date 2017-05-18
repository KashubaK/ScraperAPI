var mysql = require('mysql');
var _ = require('lodash');

var extend = _.assign;

module.exports = function UserModel(mysql_config) {
    var self = {};

    self.read = function read(key, value, cb) {
        var connection = mysql.createConnection(mysql_config);

        connection.query('SELECT * FROM `users` WHERE `' + key + '` = ?;', [value], function(err, data) {
            connection.end();

            return cb(err, data[0]);
        });
    };

    self.insert = function insert(obj, cb) {
        var connection = mysql.createConnection(mysql_config);

        obj.created_at = "" + Date.now();

        console.log(obj);

        connection.query('INSERT INTO `users` SET ?;', [obj], function(err, data) {
            connection.end();
            
            obj.id = data.insertId;
            delete obj.password; // No need to send this back

            return cb(err, obj);
        });
    };


    (function createSchema(config) {
        var database = config.database;

        var connection = mysql.createConnection(extend({
            multipleStatements: true
        }, config));

        connection.query(
            'USE `'+ database +'`; ' +
            'CREATE TABLE IF NOT EXISTS `'+ database +'`.`users` ( ' +
            '`id` INT UNSIGNED NOT NULL AUTO_INCREMENT, ' +
            '`username` VARCHAR(255) NOT NULL, ' +
            '`password` VARCHAR(255) NOT NULL, ' +
            '`email` VARCHAR(255) NOT NULL, ' +
            '`image` VARCHAR(255) NULL, ' +
            '`created_at` VARCHAR(13) NOT NULL, ' +
            'PRIMARY KEY (`id`));',
            function(err, rows) {
                if (err) throw err;
                console.log('Successfully created users table');
                connection.end();
            }
        );
    })(mysql_config);

    return self;
}