var express = require('express'),
    bodyParser = require('body-parser')
    app = express(),
    mysql = require('mysql'),
    connectionpool = mysql.createPool({
	host : 'localhost',
	user : 'root',
	password : 'jumio100!',
	database : 'TFL'
    });

app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

app.get('/players', function(req,res){
	connectionpool.getConnection(function(err, connection) {
		if (err) {
			console.error('CONNECTION error: ', err);
			res.statusCode = 503;
			res.send({
				result: 'error',
				err: err.code
			});
		} else {
			connection.query('SELECT * FROM Player', function(err, rows, fields) {
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
					code: 200,
//					fields: fields
					player: rows
//					length: rows.length
				});
				connection.release();
			});

		}
	});
//	res.send('Test');
});
app.post('/players', function(req,res){
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
			var post={
				Forename:req.body.Forename,
				Surname:req.body.Surname
			};
                        connection.query('INSERT INTO Player SET ?', post, function(err) {
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

app.get('/games', function(req,res){
        connectionpool.getConnection(function(err, connection) {
                if (err) {
                        console.error('CONNECTION error: ', err);
                        res.statusCode = 503;
                        res.send({
                                result: 'error',
                                err: err.code
                        });
                } else {
                        connection.query('SELECT * FROM Games', function(err, rows, fields) {
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
                                        code: 200,
                                        Games: rows
                                });
                                connection.release();
                        });

                }
        });
});

app.post('/games', function(req,res){
        connectionpool.getConnection(function(err, connection) {
                if (err) {
                        console.error('CONNECTION error: ', err);
                        res.statusCode = 503;
                        res.send({
                                result: 'error',
                                err: err.code
                        });
                } else {
                        var post={
                                Team1_P1:req.body.T1P1,
                                Team1_P2:req.body.T1P2,
                                Team2_P1:req.body.T2P1,
                                Team2_P2:req.body.T2P2
                        };
                        connection.query('INSERT INTO Games SET ?', post, function(err) {
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

app.put('/games/:id', function(req,res){
        connectionpool.getConnection(function(err, connection) {
                if (err) {
                        console.error('CONNECTION error: ', err);
                        res.statusCode = 503;
                        res.send({
                                result: 'error',
                                err: err.code
                        });
                } else {
			connection.query('SELECT Finished FROM Games WHERE id='+req.params.id, function(err, result) {
				if (err) {
                                        console.error(err);
                                        res.statusCode = 500;
                                        res.send({
                                                result: 'error',
                                                code: err.code
                                        });
                                } else {
					console.log(result[0])
					if (result[0]!==undefined && result[0].Finished===0){
			                        var post={
        			                        Goals_Team1:req.body.GT1,
                         			      	Goals_Team2:req.body.GT2,
                                			Finished:1
                        			};
                        			connection.query('UPDATE Games SET ? WHERE id='+req.params.id, post, function(err) {
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
	                                        res.statusCode = 500;
 	 	                                res.send({
                	                                result: 'error',
	                       	                        code:  403
                                	        });

					}

				}

			});
//                        var post={
//                                Goals_Team1:req.body.GT1,
//                                Goals_Team2:req.body.GT2,
//				Finished:1
//                        };
//                        connection.query('UPDATE Games SET ? WHERE id='+req.params.id, post, function(err) {
//                                if (err) {
//                                        console.error(err);
//                                        res.statusCode = 500;
//                                        res.send({
//                                                result: 'error',
//                                                code: err.code
//                                        });
//                                }
//                                res.send({
//                                        result: 'success',
//                                        code: 200
//                                });
//                                connection.release();
//                        });

                }
        });
});


app.listen(3000);
console.log('API Fuck yeah!');
