var strings = require('./strings.js');
var Responses = require('./responses.js');

var response = new Responses();

module.exports = function BasicQuerys() {
    this.selectFromTable = function (connectionpool, res, table) {
        connectionpool.getConnection(function (err, connection) {
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
        connection.query('INSERT INTO '+table+' SET ?;', set, function (err, result) {
            if (err) {
                connection.rollback(function(){
                   response.sendError(res, err, 500); 
                });
            } else {
                connection.commit(function(err){
                    if(err){
                        connection.rollback(function (){
                            response.sendError(res, err, 500);
                        });
                    } else {
                        var logInfo = result.insertId;
                        if (table === 'game') {
                            logInfo = strings.logging.newGameCreated + logInfo;
                        } else {
                            logInfo = strings.logging.newPlayerCreated + logInfo;
                        }
                        response.sendSuccess(res, { id: result.insertId }, 201, logInfo);
                    }
                });
            }
        });
    };
};