var strings = require('./strings.js');
var Responses = require('./responses.js');

var response = new Responses();

module.exports = function Players() {

	this.getPlayers = function (req, res, connectionpool) {
	    connectionpool.getConnection(function(err, connection) {
	        if (err) {
	            response.sendError(res, err, 503);
	        } else {
	            connection.query('SELECT * FROM player;', function getPlayersResult(err, rows, fields) {
	                if (err) {
	                    response.sendError(res, err, 500);
	                } else {
	                    response.sendSuccess(res, { players: rows }, 200, null);
	                }
	                connection.release();
	            });

	        }
	    });
	};

	this.postPlayers = function (req, res, connectionpool) {
	    connectionpool.getConnection(function(err, connection) {
	        if (err) {
	            response.sendError(res, err, 503);
	        } else {
	            var post = {
	                firstname: req.body.firstname,
	                lastname: req.body.lastname
	            };
	            connection.beginTransaction(function (err) {
	                if (err) {
	                    response.sendError(res, err, 500);
	                } else {
	                    connection.query('SELECT count(id) as count FROM player WHERE firstname=? AND lastname=?', [post.firstname, post.lastname], function checkPlayerExists(err, result) {
	                        if (err) {
	                            connection.rollback(function(){
	                                response.sendError(res, err, 500);
	                            });
	                        } else {
	                            createPlayer(connection, post, res, result);
	                        }
	                    });
	                }
	                connection.release();
	            });
	        }
	    });
	};

	function createPlayer(connection, post, res, result) {
	    if(result[0] !== undefined && result[0].count === 0) {
	        connection.query('INSERT INTO player SET ?;', post, function postPlayersResult(err, result) {
	            if (err) {
	                connection.rollback(function(){
	                    response.sendError(res, err, 500);
	                });
	            } else {
	                connection.commit(function (err) {
	                    if (err) {
	                        connection.rollback(function() {
	                           response.sendError(res, err, 500);
	                        });
	                    } else {
	                        var logInfo = strings.logging.newPlayerCreated + result.insertId;
	                        response.sendSuccess(res, { id: result.insertId }, 201, logInfo);
	                    }
	                });
	            }
	        });
	    } else {
	        response.sendCustomError(res, strings.errors.playerExists, 403)
	    }
	}
}