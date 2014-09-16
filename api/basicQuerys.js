var mysql = require('mysql');
var Responses = require('./responses.js');

var response = new Responses();

module.exports = function BasicQuerys() {
    this.selectFromTable = function (connection, res, table) {
        connection.query('SELECT * FROM '+table+';', function (err, rows) {
            if (err) {
                response.sendError(res, err, 500);
            } else {
                response.sendSuccess(res, { table: rows }, 200, null);
            }
            connection.release();
        });
    };

    this.insertIntoTable = function (connection, res, table, set) {

    };
};