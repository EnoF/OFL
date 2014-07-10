var app = angular.module('jtfl', ['ngRoute']);

app.constant('appState', {
    LEADERBOARD: 'leaderboard',
    NEW_GAME: 'newGame',
    LATEST_GAMES: 'latestGames',
    NEW_PLAYER: 'newPlayer'
});



app.directive('newGame',function() {
    return {
        restrict: 'A',
        templateUrl: 'newGame.html'
    };
});

app.directive('latestGames',function() {
    return {
        restrict: 'A',
        templateUrl: 'latestGames.html'
    };
});

app.directive('newPlayer',function() {
    return {
        restrict: 'A',
        templateUrl: 'newPlayer.html'
    };
});