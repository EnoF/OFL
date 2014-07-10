(function newGameWidget(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.directive('newGame',function() {
        return {
            restrict: 'A',
            templateUrl: 'widgets/newGame/newGame.html'
        };
    });

}(window.angular));