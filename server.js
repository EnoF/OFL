var config = require('./config.js'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    mysql = require('mysql'),
    connectionpool = mysql.createPool(config.mysql);

app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.get('/players', function(req, res) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            connection.query('SELECT * FROM player;', function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        code: err.code
                    });
                } else {
                    res.send(rows);
                }
                connection.release();
            });

        }
    });
    //  res.send('Test');
});

app.post('/players', function(req, res) {
    connectionpool.getConnection(function(err, connection) {
        //console.log(req)
        if (err) {
            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            var post = {
                Forename: req.body.Forename,
                Surname: req.body.Surname
            };
            connection.query('INSERT INTO player SET ?;', post, function(err) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        code: err.code
                    });
                }
                res.send({
                    result: 'success',
                    code: 200
                });
                connection.release();
            });

        }
    });
});

app.get('/games', function(req, res) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            connection.query('SELECT * FROM game;', function(err, rows, fields) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        code: err.code
                    });
                } else {
                    res.send(rows);
                }

                connection.release();
            });
        }
    });
});

app.post('/games', function(req, res) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            connection.query('SELECT count(finished) as count FROM game WHERE finished = 0;', req.params.id, function(err, result) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        code: err.code
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
                        connection.query('INSERT INTO game SET ?;', post, function(err, result) {
                            if (err) {
                                console.error(err);
                                res.statusCode = 500;
                                res.send({
                                    result: 'error',
                                    code: err.code
                                });
                            } else {
                                res.send({
                                    id: result.insertId
                                });
                            }
                            connection.release();
                        });
                    } else {
                        console.log(result[0].count); 
                        res.statusCode = 403;
                        res.send({
                            result: 'error',
                            code: 403
                        });
                    }
                }
            });

        }
    });
});

app.put('/games/:id', function(req, res) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {
            connection.query('SELECT finished FROM game WHERE id = ?;', req.params.id, function(err, result) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send({
                        result: 'error',
                        code: err.code
                    });
                } else {
                    console.log(result[0])
                    if (result[0] !== undefined && result[0].finished === 0) {
                        var post = {
                            team1_goals: req.body.team1.goals,
                            team2_goals: req.body.team2.goals,
                            finished: 1
                        };
                        connection.query('UPDATE game SET ? WHERE id = ?;', [post, req.params.id], function(err) {
                            if (err) {
                                console.error(err);
                                res.statusCode = 500;
                                res.send({
                                    result: 'error',
                                    code: err.code
                                });
                            } else {
                                connection.query('SELECT team1_player1, team1_player2, team2_player1, team2_player2 FROM game WHERE id = ?;', req.params.id, function(err, result) {
                                    if (err) {
                                        console.error(err);
                                        res.statusCode = 500;
                                        res.send({
                                            result: 'error',
                                            code: err.code
                                        });
                                    } else {
//                                        var players = [];
//                                        players.push({
//                                           id: result[0].team1_player1,
//                                           won: null,
//                                           point: null 
//                                        });
                                        var playerId = [
                                            result[0].team1_player1, 
                                            result[0].team1_player2, 
                                            result[0].team2_player1, 
                                            result[0].team2_player2
                                            ];
                                        var teams = {
                                            team1: {
                                                won: null,
                                                players: [result[0].team1_player1, result[0].team1_player2],
                                                points: null
                                            },
                                            team2: {
                                                won: null,
                                                players: [result[0].team2_player1, result[0].team2_player2],
                                                points: null
                                            }
                                        };                                   
                                        var points = [];
                                        for (var index = 0; index < playerId.length; ++index){
                                            connection.query('SELECT points FROM player WHERE id=?;', playerId[index], function(err, result){
                                               if (err) {
                                                console.error(err);
                                                res.statusCode = 500
                                                res.send({
                                                    result:'error',
                                                    code: err.code
                                                });
                                               } else {
                                                points.push(result[0].points);
                                                if (points.length===4) {
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
                                                    
                                                    console.log(points, playerId, difference,gain);
                                                    
                                                    var update = [];
                                                    
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
                                                    console.log(update.join(''));
                                                    if(update.length===2) {
                                                        connection.query(update[0], function(err) {
                                                            if(!err){
                                                                connection.query(update[1], function(err) {
                                                                    if(!err){
                                                                        res.send({
                                                                            result: 'success',
                                                                            code: 200
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        res.statusCode = 500
                                                        res.send({
                                                            result:'error',
                                                            code: err.code
                                                        });
                                                    }
                                                }
                                               } 
                                            });   
                                        }
                                    }
                                });
                            }
                            connection.release();
                        });
                    } else {
                        res.statusCode = 403;
                        res.send({
                            result: 'error',
                            code: 403
                        });

                    }

                }

            });
        }
    });
});

app.listen(3000);
console.log('API Fuck yeah!');
