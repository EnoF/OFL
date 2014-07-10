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
    var app = angular.module('jtfl', ['restangular', 'angucomplete']);

    app.config(function(RestangularProvider) {
        RestangularProvider.setBaseUrl('/api/v1');
    });

    app.constant('appState', {
        LEADERBOARD: 'leaderboard',
        NEW_GAME: 'newGame',
        LATEST_GAMES: 'latestGames',
        NEW_PLAYER: 'newPlayer'
    });

}(window.angular));