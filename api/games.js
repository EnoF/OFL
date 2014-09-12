var mysql = require('mysql');
var strings = require('./strings.js');
var Responses = require('./responses.js');

var response = new Responses();

module.exports = function Games() {
    this.getGames = function (req, res, connectionpool) {
        connectionpool.getConnection(function(err, connection) {
            if (err) {
                response.sendError(res, err, 503);
            } else {
                connection.query('SELECT * FROM game;', function getGamesResult(err, rows, fields) {
                    if (err) {
                        response.sendError(res, err, 500);
                    } else {
                        response.sendSuccess(res, { games: rows }, 200, null);
                    }

                    connection.release();
                });
            }
        });
    };

    this.postGames = function (req, res, connectionpool) {
        connectionpool.getConnection(function(err, connection) {
            if (err) {
                response.sendError(res, err, 503);
            } else {
                connection.beginTransaction(function (err) {
                    if (err) {
                        response.sendError(res, err, 500);
                    } else {
                        connection.query('SELECT count(finished) as count FROM game WHERE finished = 0;', req.params.id, function postGamesSelectUnfinished(err, result) {
                            if (err) {
                                connection.rollback(function (){
                                    response.sendError(res, err, 500); 
                                });
                            } else {
                                createGame (connection, req, res, result);
                            }
                        });
                        connection.release();
                    }
                });
            }
        });
    };

    this.putGames = function (req, res, connectionpool) {
        if (req.body.team1.goals === req.body.team2.goals) {
            response.sendCustomError(res, strings.errors.drawForbidden, 403);
            return;
        }
        var teams = {
            team1: {
                goals: req.body.team1.goals,
                won: hasWon(req.body.team1.goals, req.body.team2.goals),
                players: null,
                points: null
            },
            team2: {
                goals: req.body.team2.goals,
                won: hasWon(req.body.team2.goals, req.body.team1.goals),
                players: null,
                points: null
            }
        };
        console.log(req.body.team1.goals, ':', req.body.team2.goals, teams.team1.won, teams.team2.won);
        var update = [];
        connectionpool.getConnection(function (err, connection) {

            if (err) {
                response.sendError(res, err, 503);
            } else {
                connection.beginTransaction(function putGamesTransaction(err) {
                    if (err) {
                        response.sendError(res, err, 500);
                    } else {
                        selectFromGame(connection, req, res, updateGame, teams);
                    }
                });
            }
        });
    };

    this.deleteGames = function (req, res, connectionpool) {
        connectionpool.getConnection(function (err, connection) {
            if (err) {
                response.sendError(res, err, 503);
            } else {
                connection.beginTransaction(function deleteGamesTransaction(err) {
                    if (err) {
                        response.sendError(res, err, 500);
                    } else {
                        selectFromGame(connection, req, res, deleteGame);
                    }
                });
            }
        });
    };

    function selectFromGame(connection, req, res, callback, teams){
        connection.query('SELECT finished FROM game WHERE id = ?;', req.params.id, function (err, result) {
            if (err) {
                connection.rollback(function () {
                    response.sendError(res, err, 500);
                });
            } else {
                if (result[0] !== undefined && result[0].finished === 0) {
                    callback(connection, req, res, teams);
                } else if (result[0] !== undefined && result[0].finished === 1) {
                    response.sendCustomError(res, strings.errors.gameFinished, 403);
                } else {
                    response.sendCustomError(res, strings.errors.gameNotFound, 403);
                }
            }
        });
        connection.release();
    }

    function createGame (connection, req, res, result) {
        if(result[0] !== undefined && result[0].count === 0) {
            var post = {
                team1_player1: req.body.team1[0].id,
                team1_player2: req.body.team1[1].id,
                team2_player1: req.body.team2[0].id,
                team2_player2: req.body.team2[1].id
            };
            connection.query('INSERT INTO game SET ?;', post, function postGamesResult(err, result) {
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
                            var logInfo = strings.logging.newGameCreated + result.insertId;
                            response.sendSuccess(res, { id: result.insertId }, 201, logInfo);
                        }
                    });
                }
                
            });
        } else {
            response.sendCustomError(res, strings.errors.gameUnfinished, 403);
        }
    }

    function calculateEloGain (points) {
        var pointsTeam1 = points[0]+points[1];
        var pointsTeam2 = points[2]+points[3];
        var eloMax = 400;
        var difference = 0;
        if (Math.abs(pointsTeam1-pointsTeam2) > eloMax){
            difference = eloMax;
        } else if (Math.abs(pointsTeam1-pointsTeam2) < -eloMax) {
            difference = -eloMax;
        } else {
            difference = Math.abs(pointsTeam1-pointsTeam2);
        }
        return Math.round((1/(1+Math.pow(10,difference/eloMax)))*10);
    }

    function createPlayerUpdateQuery (teams, gain, update) {
        if(teams.team1.won) {
            teams.team1.points = gain;
            teams.team2.points = -gain;
            update.push(playerUpdateQueryBuilder (strings.query.setVictoriesPlusOneWhereId, teams.team1));
            update.push(playerUpdateQueryBuilder (strings.query.setDefeatesPlusOneWhereId, teams.team2));
        } else {
            teams.team1.points = -gain;
            teams.team2.points = gain;
            update.push(playerUpdateQueryBuilder (strings.query.setDefeatesPlusOneWhereId, teams.team1));
            update.push(playerUpdateQueryBuilder (strings.query.setVictoriesPlusOneWhereId, teams.team2));
        }
    }

    function playerUpdateQueryBuilder (result, team) {
        var query = strings.query;
        return  query.updatePlayerSetPoints+mysql.escape(team.points)+result+mysql.escape(team.players[0])+query.orWhereId+mysql.escape(team.players[1])+';';
    }

    function updateGame (connection, req, res, teams) {
        var post = {
            team1_goals: teams.team1.goals,
            team2_goals: teams.team2.goals,
            finished: 1
        };
        connection.query('UPDATE game SET ? WHERE id = ?;', [post, req.params.id], function putGamesUpdateResult(err) {
            if (err) {
                connection.rollback(function(){
                    response.sendError(res, err, 500);
                });
            } else {
                connection.query('SELECT team1_player1, team1_player2, team2_player1, team2_player2 FROM game WHERE id = ?;', req.params.id, function putGamesSelectPlayers(err, result) {
                    if (err) {
                        connection.rollback(function(){
                            response.sendError(res, err, 500);
                        });
                    } else {
                        var playerId = [
                            result[0].team1_player1, 
                            result[0].team1_player2, 
                            result[0].team2_player1, 
                            result[0].team2_player2
                            ];
                        teams.team1.players = [result[0].team1_player1, result[0].team1_player2];
                        teams.team2.players = [result[0].team2_player1, result[0].team2_player2];

                        updatePlayersGetPoints(connection, res, playerId, teams);
                    }
                });
            }
            
        });
    }

    function updatePlayersGetPoints (connection, res, playerId, teams) {
        var points = [];
        var update = [];
        for (var index = 0; index < playerId.length; ++index) {
            connection.query('SELECT points FROM player WHERE id=?;', playerId[index], function putGamesSelectPlayersPoints(err, result) {
                if (err) {
                    connection.rollback(function(){
                        response.sendError(res, err, 500);
                    });
                } else {
                    points.push(result[0].points);
                    updatePlayersQuery(connection, res, teams, points, update);
                }
            });
        }
    }

    function updatePlayersQuery(connection, res, teams, points, update) {
        if (points.length===4) {
            var gain = calculateEloGain(points);
             createPlayerUpdateQuery (teams, gain, update);
             console.log(update.join());

            if(update.length===2) {
            connection.query(update[0], function putGamesUpdateTeam1(err) {
                if(!err){
                    connection.query(update[1], function putGamesUpdateTeam2(err) {
                        if(!err){
                            connection.commit(function (err) {
                                if (err) {
                                    connection.rollback(function() {
                                       response.sendError(res, err, 500);
                                    });
                                }
                            });
                            response.sendSuccess(res, { result: 'success' }, 200, null);
                        }
                    });
                }
            });
            } else {
                connection.rollback(function(){
                    response.sendError(res, err, 500);
                });
            }
        }
    }

    function deleteGame(connection, req, res) {
    connection.query('DELETE FROM game WHERE id=?', req.params.id, function deleteGamesUpdateTable(err) {
        if (err) {
            connection.rollback(function () {
                response.sendError(res, err, 500);
            });
        } else {
            connection.commit(function (err) {
                if (err) {
                    connection.rollback(function () {
                    });
                    response.sendError(res, err, 500);
                }
            });
            var logInfo = strings.logging.playerDeleted + req.params.id;

            response.sendSuccess(res, null, 204, logInfo);
        }
    });
    }

    function hasWon(self, opponent) {
        return self > opponent;
    }
};