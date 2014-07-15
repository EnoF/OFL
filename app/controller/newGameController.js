(function newGameController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('newGameController', function($scope, appState) {
        $scope.people = [
            {name: "Dominik", id: 1},
            {name: "Stefan", id: 2},
            {name: "Lukas", id: 3},
            {name: "Benny", id: 4}
        ];

        $scope.matchStarted = false;
        $scope.startMatch = function startMatch() {
            $scope.matchStarted = true;
        };

        $scope.finishMatch = function finishMatch() {
            var won;
            if($scope.teams.home.points > $scope.teams.away.points) {
                won = 'Home';
            } else {
                won = 'Away';
            }
            alert(won + ' won with ' + $scope.teams.home.points + ':' + $scope.teams.away.points);
        };

        $scope.teams = {
            home: {
                points: 0,
                players: [
                    {},
                    {}
                ],
            },
            away: {
                points: 0,
                players: [
                    {},
                    {}
                ],
            }
        };

    });

}(window.angular));