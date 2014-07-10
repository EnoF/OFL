(function bootstrapperController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('bootstrapperController', function($scope, appState) {
        $scope.state = appState.LEADERBOARD;

        $scope.isInLeaderboardState = function() {
            return $scope.state === appState.LEADERBOARD;
        };

        $scope.isInNewGameState = function() {
            return $scope.state === appState.NEW_GAME;
        };

        $scope.isInLatestGamesState = function() {
            return $scope.state === appState.LATEST_GAMES;
        };

        $scope.isInNewPlayerState = function() {
            return $scope.state === appState.NEW_PLAYER;
        };

        $scope.setStateToLeaderboard = function() {
            $scope.state = appState.LEADERBOARD;
        }

        $scope.setStateToNewGame = function() {
            $scope.state = appState.NEW_GAME;
        }

        $scope.setStateToLatestGames = function() {
            $scope.state = appState.LATEST_GAMES;
        }

        $scope.setStateToNewPlayer= function() {
            $scope.state = appState.NEW_PLAYER;
        }

    });

}(window.angular));