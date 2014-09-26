(function newPlayerController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('newPlayerController', function($scope, Restangular) {

        $scope.player = {
            firstname: null,
            lastname: null
        };

        $scope.save = function save(player) {
            $scope.player = angular.copy(player);

            Restangular.all('players')
                .post( $scope.player )
                .then(function(player) {
                    $location.path( "/players/" );
                    console.warn("success",player);
                })
                .then(null, function(player) {
                    console.warn("error",player);
                })
            ;

        };

    });

}(window.angular));