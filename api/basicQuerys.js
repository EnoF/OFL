var Responses = require('./responses.js');

var response = new Responses();

module.exports = function BasicQuerys() {
    this.selectFromTable = function (connectionpool, res, table) {
        connectionpool.getConnection(function(err, connection) {
            if (err) {
                response.sendError(res, err, 503);
            } else {
                connection.query('SELECT * FROM '+table+';', function (err, rows) {
                    if (err) {
                        response.sendError(res, err, 500);
                    } else {
                        response.sendSuccess(res, { table: rows }, 200, null);
                    }
                    connection.release();
                });
            }
        });
    };

    this.insertIntoTable = function (connection, res, table, set) {

    };
};