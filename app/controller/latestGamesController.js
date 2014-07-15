(function latestGamesController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('latestGamesController', function($scope, Restangular) {
        $scope.games = [
            {
                id: 1,
                finished: true,
                teamHome: {
                    points: 10,
                    won: true,
                    players: [
                        {
                            id: 1,
                            name: 'Dominik Kukacka'
                        }
                    ]
                },
                teamAway: {
                    points: 0,
                    won: false,
                    players: [
                        {
                            id: 2,
                            name: 'Stefan Schacherl'
                        }
                    ]
                },

            },
            {
                id: 2,
                finished: false,
                teamHome: {
                    points: 9,
                    won: false,
                    players: [
                        {
                            id: 1,
                            name: 'Dominik Kukacka'
                        },
                        {
                            id: 2,
                            name: 'Stefan Schacherl'
                        }
                    ]
                },
                teamAway: {
                    points: 0,
                    won: false,
                    players: [
                        {
                            id: 3,
                            name: 'Lukas'
                        },
                        {
                            id: 3,
                            name: 'Benny'
                        },
                    ]
                },

            },
        ];

        $scope.order = 'id';
        $scope.reverse = false;

        $scope.changeOrder = function(name) {
            if(name === $scope.order) {
                $scope.reverse = !$scope.reverse;
            } else {
                $scope.order = name;
                $scope.reverse = false;
            }
        }


        Restangular.all('games').getList()
        .then(function(games) {
            $scope.games = games;
        }, function() {

        });
    });

}(window.angular));