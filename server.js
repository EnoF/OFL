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
                    if (result[0] !== undefined && result[0].Finished === 0) {
                        var post = {
                            team1_goals: req.body.team1.goals,
                            team2_goals: req.body.team2.goals,
                            finished: 1
                        };
                        connection.query('UPDATE game SET ? WHERE id = ?', req.params.id, post, function(err) {
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
