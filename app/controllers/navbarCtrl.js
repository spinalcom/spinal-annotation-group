angular.module('app.controllers')
  .controller('navbarCtrl', ["$scope", "authService", "$location", "$routeParams",
    function ($scope, authService, $location, $routeParams) {
      $scope.username = "";
      $scope.connected = false;
      authService.wait_connect().then(() => {
        $scope.username = authService.get_user().username;
        $scope.connected = true;
        $scope.viewer = $routeParams.filepath;
        if ($scope.viewer) {
          $scope.viewer = atob($scope.viewer);
        } else {
          $scope.viewer = "viewer";
        }
        console.log($routeParams.filepath);

      });
      $scope.logout = () => {
        $location.path('/login');
      };
      // get in SpinalDrive_Env
      $scope.layouts = [

        {
          id: "drag-viewer",
          name: "viewer",
          cfg: {
            isClosable: true,
            title: "viewer",
            type: 'component',
            componentName: 'SpinalHome',
            componentState: {
              template: 'forgeviewer.html',
              controller: 'forgeViewerCtrl'
            }
          }
        },


      ];





    }
  ]);