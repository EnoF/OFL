(function LeaderboardWidget(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.directive('leaderboard',function() {
        return {
            restrict: 'A',
            templateUrl: 'widgets/leaderboard/leaderboard.html',
            controller: 'leaderboardController'
        };
    });

}(window.angular));