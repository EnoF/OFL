/*
 * Jumio Inc.
 *
 * Version: 1.0.4
 * Copyright (C) 2010 - 2014
 * All rights reserved.
 */
(function (angular) {
    'use strict';

    // Angular app initialization.
    var app = angular.module('jtfl', ['restangular', 'angucomplete', 'ngRoute']);

    app.config(function(RestangularProvider) {
        RestangularProvider.setBaseUrl('/api/v1');
    });

    app.config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl : 'views/leaderboard.html',
                controller  : 'leaderboardController'
            })

            .when('/newGame', {
                templateUrl : 'views/newGame.html',
                controller  : 'newGameController'
            })

            .when('/latestGames', {
                templateUrl : 'views/latestGames.html',
                controller  : 'latestGamesController'
            })

            .when('/newPlayer', {
                templateUrl : 'views/newPlayer.html',
                controller  : 'newPlayerController'
            })
        ;
    });


    app.constant('appState', {
        LEADERBOARD: 'leaderboard',
        NEW_GAME: 'newGame',
        LATEST_GAMES: 'latestGames',
        NEW_PLAYER: 'newPlayer'
    });

}(window.angular));