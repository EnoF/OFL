(function BootstrapperWidget(angular, undefined) {
    'use strict';

    var app = angular.module('jtfl');

    app.directive('bootstrapper',function() {
        return {
            restrict: 'A',
            templateUrl: 'widgets/bootstrapper/bootstrapper.html',
            controller: 'bootstrapperController'
        };
    });

}(window.angular));