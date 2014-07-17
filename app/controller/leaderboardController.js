(function leaderboardController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('leaderboardController', function($scope, Restangular) {
        $scope.players = [];

        Restangular.all('players').getList()
        .then(function(players) {
            $scope.players = players;
        }, function(err) {
            console.log('dafuq',err)
        });

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

    });

}(window.angular));