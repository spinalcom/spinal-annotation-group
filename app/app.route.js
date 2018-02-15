angular.module('app.route')
  .config(["$routeProvider", "$locationProvider",
    function ($routeProvider, $locationProvider) {
      $routeProvider

        .when("/viewer/:filepath", {
          templateUrl: "app/templates/main.html",
          authenticate: true,
          controller: 'mainCtrl'
        })
        .when("/login", {
          templateUrl: "app/templates/login.html",
          authenticate: false,
          controller: 'loginCtrl'
        })
        .when('/404', {
          authenticate: false,
          controller: ['$location', function ($location) {
            $location.replace('/drive/');
          }]
        }).otherwise({
          redirectTo: '/404'
        });

      // .otherwise({
      //   redirectTo: '/viewer'
      // });
    }
  ]);