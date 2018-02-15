angular.module('app.controllers')
  .controller('mainCtrl', ["$scope", "$routeParams", "goldenLayoutService", "spinalModelDictionary",
    function ($scope, $routeParams, goldenLayoutService, spinalModelDictionary) {
      goldenLayoutService.init();
    }
  ]);