(function leaderboardController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('leaderboardController', function($scope, Restangular) {
        $scope.players = [
            {
                rank: 1,
                name: 'Dominik Kukacka',
                points: 1337,
                wins: 10,
                defeats: 0
            },
            {
                rank: 2,
                name: 'Stefan Schacherl',
                points: 50,
                wins: 1,
                defeats: 0
            },
            {
                rank: 3,
                name: 'Max Mustermann',
                points: 0,
                wins: 0,
                defeats: 0
            }
        ];

        $scope.order = 'rank';
        $scope.reverse = false;

        $scope.changeOrder = function(name) {
            if(name === $scope.order) {
                $scope.reverse = !$scope.reverse;
            } else {
                $scope.order = name;
                $scope.reverse = false;
            }
        }


        Restangular.all('players').getList()
        .then(function(players) {
            $scope.players = players;
        }, function() {

        });
    });

}(window.angular));