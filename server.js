var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var strings = require('./api/strings.js');
var Responses = require('./api/responses.js');

var response = new Responses();
var app = express();
var connectionpool = mysql.createPool(config.mysql);

function hasWon(goalsTeam1, goalsTeam2) {
    return ((goalsTeam1 > goalsTeam2) ? true : false);
}

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

function createQueryPlayerUpdate (points, teams, update) {
    var pointsTeam1 = points[0]+points[1];
    var pointsTeam2 = points[2]+points[3];
    var eloMax = 400;
    if (Math.abs(pointsTeam1-pointsTeam2) > eloMax){
        var difference = eloMax;
    } else if (Math.abs(pointsTeam1-pointsTeam2) < -eloMax) {
        var difference = -eloMax;
    } else {
        var difference = Math.abs(pointsTeam1-pointsTeam2);
    }
    var gain = Math.round((1/(1+Math.pow(10,difference/eloMax)))*10);

    if(teams.team1.won) {
        teams.team1.points = gain;
        teams.team2.points = -gain;
        update.push(
            'UPDATE player SET points=points+'+mysql.escape(teams.team1.points)
            +', victories=victories+1 WHERE id='+mysql.escape(teams.team1.players[0])
            +' OR id=' +mysql.escape(teams.team1.players[1])
            +';');
        update.push(
            'UPDATE player SET points=points+'+mysql.escape(teams.team2.points)
            +', defeats=defeats+1 WHERE id='+mysql.escape(teams.team2.players[0])
            +' OR id='+mysql.escape(teams.team2.players[1])
            +';');
    } else {
        teams.team1.points = -gain;
        teams.team2.points = gain;
        update.push(
            'UPDATE player SET points=points+'+mysql.escape(teams.team1.points)
            +', defeats=defeats+1 WHERE id='+mysql.escape(teams.team1.players[0])
            +' OR id='+mysql.escape(teams.team1.players[1])
            +';');
        update.push(
            'UPDATE player SET points=points+'+mysql.escape(teams.team2.points)
            +', victories=victories+1 WHERE id='+mysql.escape(teams.team2.players[0])
            +' OR id='+mysql.escape(teams.team2.players[1])
            +';');
    }
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
        createQueryPlayerUpdate(points, teams, update);

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

app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.get('/players', function getPlayers(req, res) {
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
});

app.post('/players', function postPlayers(req, res) {
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
});

app.get('/games', function getGames(req, res) {
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
});

app.post('/games', function postGames(req, res) {
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
});

app.put('/games/:id', function putGames(req, res) {
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
    var update = [];
    connectionpool.getConnection(function(err, connection) {

        if (err) {
            response.sendError(res, err, 503);
        } else {
            connection.beginTransaction(function putGamesTransaction(err) {
                if (err) {
                    response.sendError(res, err, 500);
                } else {
                    connection.query('SELECT finished FROM game WHERE id = ?;', req.params.id, function putGamesCheckUnfinished(err, result) {
                        if (err) {
                            connection.rollback(function(){
                                response.sendError(res, err, 500);
                            });
                        } else {
                            if (result[0] !== undefined && result[0].finished === 0) {
                                updateGame (connection, req, res, teams);
                            } else if (result[0] !== undefined && result[0].finished === 1) {
                                console.log(result[0]);
                                response.sendCustomError(res, strings.errors.gameFinished, 403);
                            } else {
                                response.sendCustomError(res, strings.errors.gameNotFound, 403);
                            }
                        }
                    });
                    connection.release();
                }
            });
        }
    });
});

app.listen(3000);
console.log('API Fuck yeah!');