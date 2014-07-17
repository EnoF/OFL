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
    app.value('apiPort', '3000');

    app.config(function($routeProvider, RestangularProvider) {

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

    app.run(function(Restangular, $location, apiPort) {
        Restangular.setBaseUrl($location.protocol() + '://' + $location.host() + ':' + apiPort);
    });

}(window.angular));