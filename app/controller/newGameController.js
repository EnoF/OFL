(function newGameController(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.controller('newGameController', function($scope, appState) {
        $scope.people = [
            {firstName: "Daryl", surname: "Rowland", twitter: "@darylrowland", pic: "img/daryl.jpeg"},
            {firstName: "Alan", surname: "Partridge", twitter: "@alangpartridge", pic: "img/alanp.jpg"},
            {firstName: "Annie", surname: "Rowland", twitter: "@anklesannie", pic: "img/annie.jpg"}
        ];
    });

}(window.angular));