var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var Games = require('./api/games.js');
var Players = require('./api/players.js');

var games = new Games();
var players = new Players();
var app = express();
var connectionpool = mysql.createPool(config.mysql);


app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.get('/players', function getPlayers(req, res) {
    players.getPlayers(res, connectionpool);
});

app.post('/players', function postPlayers(req, res) {
    players.postPlayers(req, res, connectionpool);
});

app.get('/games', function getGames(req, res) {
    games.getGames(res, connectionpool);
});

app.post('/games', function postGames(req, res) {
    games.postGames(req, res, connectionpool);
});

app.put('/games/:id', function putGames(req, res) {
    games.putGames(req, res, connectionpool);
});

app.delete('/games/:id', function deleteGames(req, res) {
    games.deleteGames(req, res, connectionpool);
});

app.listen(3000);
console.log('API Fuck yeah!');