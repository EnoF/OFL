(function latestGamesWidget(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.directive('latestGames',function() {
        return {
            restrict: 'A',
            templateUrl: 'widgets/latestGames/latestGames.html'
        };
    });

}(window.angular));