angular.module('app.spinalcom')
  .factory('spinalModelDictionary', ["$q", "ngSpinalCore", "config", "authService", "$routeParams", "$location",
    function ($q, ngSpinalCore, config, authService, $routeParams, $location) {
      let factory = {};
      factory.model = 0;
      factory.init = () => {
        var deferred = $q.defer();
        if (factory.model == 0) {
          authService.wait_connect().then(() => {
            let user = authService.get_user();
            let path = $routeParams.filepath;
            console.log(path)
            if (path) {
              path = atob(path);
              ngSpinalCore.load(path).then((m) => {
                factory.model = m;
                console.log(m);
                deferred.resolve(m);

              }, () => {
                let msg = "not able to load : " + path;
                console.error(msg);
                $location.replace('/drive/');
                deferred.reject(msg);
              });
            }
          }, () => {
            let msg = "not able to load : " + path;
            console.error(msg);
            $location.replace('/drive/');
            deferred.reject(msg);
          });
        } else
          deferred.resolve(factory.model);
        return deferred.promise;
      };
      return factory;
    }
  ]);