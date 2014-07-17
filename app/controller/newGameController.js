(function newGameController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('newGameController', function($scope, Restangular) {
        $scope.people = [
            {name: "Dominik", id: 1},
            {name: "Stefan", id: 2},
            {name: "Lukas", id: 3},
            {name: "Benny", id: 4}
        ];

        $scope.matchStarted = false;
        $scope.startMatch = function startMatch() {

            var teams = { team1: [], team2: [] };
            ['team1', 'team2'].forEach(function(team) {
                for (var i = $scope.teams[team].players.length - 1; i >= 0; i--) {
                    var player = $scope.teams[team].players[i].originalObject;
                    teams[team].push(player);
                };
            });

            Restangular.all('games')
                .post( teams )
                .then(function(data) {
                    // $location.path( "/games/" );
                    console.warn("success",data);
                    $scope.matchStarted = true;
                })
                .then(null, function(data) {
                    console.warn("error",data);
                })
            ;
        };

        $scope.finishMatch = function finishMatch() {
            var won;
            if($scope.teams.team1.points > $scope.teams.team2.points) {
                won = 'team1';
            } else {
                won = 'team2';
            }
            alert(won + ' won with ' + $scope.teams.team1.points + ':' + $scope.teams.team2.points);
        };

        $scope.teams = {
            team1: {
                points: 0,
                players: [
                    {},
                    {}
                ],
            },
            team2: {
                points: 0,
                players: [
                    {},
                    {}
                ],
            }
        };

    });

}(window.angular));