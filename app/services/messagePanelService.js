angular.module('app.spinalcom')

.factory('messagePanelFactory', ["$rootScope", "$compile", "$templateCache", "$http",
    function ($rootScope, $compile, $templateCache, $http ) {
                let load_template = (uri, name) => {
        $http.get(uri).then((response) => {
            $templateCache.put(name, response.data);
        }, (errorResponse) => {
            console.log('Cannot load the file ' + uri);
        });
        };
        let toload = [{
        uri: 'app/templates/commentTemplate.html',
        name: 'commentTemplate.html'
        }];
        for (var i = 0; i < toload.length; i++) {
            load_template(toload[i].uri, toload[i].name);
        }

        this.panel = new PanelClass(v, "message Panel");

        this.panel.container.style.right = "0px";
        this.panel.container.style.width = "400px";
        this.panel.container.style.height = "600px";
        this.panel.container.padding = "0px";

        var _container = document.createElement('div');
        _container.style.height = "calc(100% - 45px)";
        _container.style.overflowY = 'auto';
        this.panel.container.appendChild(_container);

        // $(_container).html("<div ng-controller=\"commentCtrl\" ng-cloak>" +
        //   $templateCache.get("commentTemplate.html") + "</div>");
        // $compile($(_container).contents())($rootScope);
        var init = false
        return {
            getPanel : () => { 

                if(init == false) {
                    init = true;
                    $(_container).html("<div ng-controller=\"commentCtrl\" class=\"panelContent\" ng-cloak>" +
                    $templateCache.get("commentTemplate.html") + "</div>");
                    $compile($(_container).contents())($rootScope);
                }

                return this.panel
            }
        }

    }])

.factory('messagePanelService', ["$rootScope", "$compile", "$templateCache", "$http", "messagePanelFactory",
    function ($rootScope, $compile, $templateCache, $http, messagePanelFactory) {

    var currentNote
    var init = false
    var myCallback = null;

    return {

        hideShowPanel : (note) => {
            if(init == false) {
                init = true;   
                this.panel =  messagePanelFactory.getPanel();
            }

            if(this.panel.isVisible())
                this.panel.setVisible(false);
            else
                this.panel.setVisible(true);
            currentNote = note;

            if (myCallback)
                myCallback(currentNote);
            },

        register : (callback) => {
            myCallback = callback;
            callback(currentNote);
        }

    }

}])

    
.controller('commentCtrl',["$scope","messagePanelService","authService",function($scope,messagePanelService,authService){
   
    let onChange = ()=> {
        let obj = FileSystem._objects[$scope.messages._server_id]
        $scope.messages = obj.get_obj()
        $scope.$apply();
    }

    messagePanelService.register((annotation) => {
        
        if($scope.messages) {
            let obj = FileSystem._objects[$scope.messages._server_id]
            if(obj)
                obj.unbind(onChange);
        }

        if(annotation) {
            $scope.messages = annotation;
            let obj = FileSystem._objects[$scope.messages._server_id];
            if(obj)
                obj.bind(onChange);
        }
    })

    $scope.user = authService.get_user();

    $scope.messageText = "";

    $scope.removeMessage = (message) => {
        let mod = FileSystem._objects[$scope.messages._server_id];
    
        if(mod) {
            for (var i = 0; i < mod.notes.length; i++) {
                if(mod.notes[i]._server_id == message._server_id) {
                    mod.notes.splice(i,1);
                }
            }
        }

    }

    $scope.SendMessage = () => {
        let mod = FileSystem._objects[$scope.messages._server_id];
        if($scope.messageText != "" && $scope.messageText.trim() != "") {
            var message = new MessageModel();
            message.owner.set($scope.user.id);
            message.username.set($scope.user.username);
            message.message.set($scope.messageText);

            if(mod) {
                mod.notes.push(message);
                $scope.messageText = "";
            }
        }
    }
    
}])
