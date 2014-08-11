var config = require('./config.js'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    mysql = require('mysql'),
    connectionpool = mysql.createPool(config.mysql);

function sendError(res, err, statCode) {
    console.error('CONNECTION error: ', err);
    res.statusCode = statCode;
    res.send({
        result: 'error',
        err: err.code
    });
};

function sendCustomError(res, errMessage, errCode, statCode) {
    console.error('APPLICATION error: ', errMessage);
    res.statusCode = statCode;
    res.send({
        result: errMessage,
        err: errCode
    });
};

function createQueryPlayerUpdate (post, points, teams, update) {
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

    console.log(points, difference, gain);

    if(post.team1_goals > post.team2_goals) {
        teams.team1.won = true;
        teams.team1.points = gain;
        teams.team2.won = false;
        teams.team2.points = -gain;
        update.push('UPDATE player SET points=points+'+teams.team1.points+', victories=victories+1 WHERE id='+teams.team1.players[0]+' OR id='+teams.team1.players[1]+';');
        update.push('UPDATE player SET points=points+'+teams.team2.points+', defeats=defeats+1 WHERE id='+teams.team2.players[0]+' OR id='+teams.team2.players[1]+';');
    } else {
        teams.team1.won = false;
        teams.team1.points = -gain;
        teams.team2.won = true;
        teams.team2.points = gain;
        update.push('UPDATE player SET points=points+'+teams.team1.points+', defeats=defeats+1 WHERE id='+teams.team1.players[0]+' OR id='+teams.team1.players[1]+';');
        update.push('UPDATE player SET points=points+'+teams.team2.points+', victories=victories+1 WHERE id='+teams.team2.players[0]+' OR id='+teams.team2.players[1]+';');
    }
    console.log(update.join());
};

function updateGame (connection, req, res, post, teams) {
    connection.query('UPDATE game SET ? WHERE id = ?;', [post, req.params.id], function putGamesUpdateResult(err) {
        if (err) {
            connection.rollback(function(){
                sendError(res, err, 500);
            });
        } else {
            connection.query('SELECT team1_player1, team1_player2, team2_player1, team2_player2 FROM game WHERE id = ?;', req.params.id, function putGamesSelectPlayers(err, result) {
                if (err) {
                    connection.rollback(function(){
                        sendError(res, err, 500);
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

                    updatePlayersGetPoints(connection, res, post, playerId, teams);
                }
            });
        }
        
    });
};

function updatePlayersGetPoints (connection, res, post, playerId, teams) {
    var points = [];
    var update = [];
    for (var index = 0; index < playerId.length; ++index) {
        connection.query('SELECT points FROM player WHERE id=?;', playerId[index], function putGamesSelectPlayersPoints(err, result) {
            if (err) {
                connection.rollback(function(){
                    sendError(res, err, 500);
                });
            } else {
                points.push(result[0].points);
                updatePlayersQuery(connection, res, post, teams, points, update);
            }
        });
    }
};

function updatePlayersQuery(connection, res, post, teams, points, update) {
    if (points.length===4) {
        createQueryPlayerUpdate(post, points, teams, update);
        console.log(update.join(''));

        if(update.length===2) {
        connection.query(update[0], function putGamesUpdateTeam1(err) {
            if(!err){
                connection.query(update[1], function putGamesUpdateTeam2(err) {
                    if(!err){
                        connection.commit(function (err) {
                            if (err) {
                                connection.rollback(function() {
                                   sendError(res, err, 500);
                                });
                            }
                        });
                        res.send({
                            result: 'success',
                            code: 200
                        });
                    }
                });
            }
        });
        } else {
            connection.rollback(function(){
                sendError(res, err, 500);
            });
        }
    }
};

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
            sendError(res, err, 503);
        } else {
            connection.query('SELECT * FROM player;', function getPlayersResult(err, rows, fields) {
                if (err) {
                    sendError(res, err, 500);
                } else {
                    res.send(rows);
                }
                connection.release();
            });

        }
    });
});

app.post('/players', function postPlayers(req, res) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            sendError(res, err, 503);
        } else {
            var post = {
                firstname: req.body.firstname,
                lastname: req.body.lastname
            };
            console.log(post);
            connection.beginTransaction(function (err) {
                if (err) {
                    sendError(res, err, 500);
                }
                connection.query('INSERT INTO player SET ?;', post, function postPlayersResult(err, result) {
                    if (err) {
                        connection.rollback(function(){
                            sendError(res, err, 500);
                        });
                    } else {
                        connection.commit(function (err) {
                            if (err) {
                                connection.rollback(function() {
                                   sendError(res, err, 500);
                                });
                            }
                        });
                        res.send({
                            result: 'success',
                            code: 200,
                            id: result.insertId
                        });
                    }
                });
                connection.release();
            });
        }
    });
});

app.get('/games', function getGames(req, res) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            sendError(res, err, 503);
        } else {
            connection.query('SELECT * FROM game;', function getGamesResult(err, rows, fields) {
                if (err) {
                    sendError(res, err, 500);
                } else {
                    res.send(rows);
                }

                connection.release();
            });
        }
    });
});

app.post('/games', function postGames(req, res) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            sendError(res, err, 503);
        } else {
            connection.beginTransaction(function (err) {
                if (err) {
                    sendError(res, err, 500);
                }
                connection.query('SELECT count(finished) as count FROM game WHERE finished = 0;', req.params.id, function postGamesSelectUnfinished(err, result) {
                    if (err) {
                        connection.rollback(function (){
                            sendError(res, err, 500); 
                        });
                    } else {
                        if(result[0] !== undefined && result[0].count === 0) {
                            var post = {
                                team1_player1: req.body.team1[0].id,
                                team1_player2: req.body.team1[1].id,
                                team2_player1: req.body.team2[0].id,
                                team2_player2: req.body.team2[1].id
                            };
                            console.log(post);
                            connection.query('INSERT INTO game SET ?;', post, function postGamesResult(err, result) {
                                if (err) {
                                    connection.rollback(function(){
                                       sendError(res, err, 500); 
                                    });
                                } else {
                                    connection.commit(function(err){
                                        if(err){
                                            connection.rollback(function (){
                                                sendError(res, err, 500);
                                            });
                                        }
                                    });
                                    res.send({
                                        id: result.insertId
                                    });
                                }
                                connection.release();
                            });
                        } else {
                            console.log(result[0].count);
                            sendCustomError(res, 'Last game is not finished yet!', 'LAST_GAME_UNFINISHED_ERROR', 403);
                        }
                    }
                });
            });
        }
    });
});

app.put('/games/:id', function putGames(req, res) {
    var post = {
        team1_goals: req.body.team1.goals,
        team2_goals: req.body.team2.goals,
        finished: 1
    };
    var update = [];
    var teams = {
        team1: {
            won: null,
            players: null,
            points: null
        },
        team2: {
            won: null,
            players: null,
            points: null
        }
    };   
    connectionpool.getConnection(function(err, connection) {

        if (err) {
            sendError(res, err, 503);
        } else {
            connection.beginTransaction(function putGamesTransaction(err) {
                if (err) {
                    sendError(res, err, 500);
                } else {
                    connection.query('SELECT finished FROM game WHERE id = ?;', req.params.id, function putGamesCheckUnfinished(err, result) {
                        if (err) {
                            connection.rollback(function(){
                                sendError(res, err, 500);
                            });
                        } else {
                            console.log(result[0]);
                            if (result[0] !== undefined && result[0].finished === 0) {
                                updateGame (connection, req, res, post, teams);
                            } else {
                                sendCustomError(res, 'Game is already in finished state!', 'FINISHED_GAME_ERROR', 403);
                            }
                            connection.release();
                        }
                    });
                }
            });
        }
    });
});

app.listen(3000);
console.log('API Fuck yeah!');
