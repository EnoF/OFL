(function latestGamesWidget(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.directive('newPlayer',function() {
        return {
            restrict: 'A',
            templateUrl: 'widgets/newPlayer/newPlayer.html',
            controller: 'newPlayerController'
        };
    });

}(window.angular));