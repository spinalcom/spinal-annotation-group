angular.module('app.spinalcom')

.factory('FilePanelFactory', ["$rootScope", "$compile", "$templateCache", "$http",
    function ($rootScope, $compile, $templateCache, $http ) {
                let load_template = (uri, name) => {
        $http.get(uri).then((response) => {
            $templateCache.put(name, response.data);
        }, (errorResponse) => {
            console.log('Cannot load the file ' + uri);
        });
        };
        let toload = [{
        uri: 'app/templates/fileTemplate.html',
        name: 'fileTemplate.html'
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

        var init = false
        return {
            getPanel : () => { 

                if(init == false) {
                    init = true;
                    $(_container).html("<div ng-controller=\"fileCtrl\" class=\"panelContent\" ng-cloak>" +
                    $templateCache.get("fileTemplate.html") + "</div>");
                    $compile($(_container).contents())($rootScope);
                }

                return this.panel
            }
        }

    }])

.factory('FilePanelService', ["$rootScope", "$compile", "$templateCache", "$http", "FilePanelFactory",
    function ($rootScope, $compile, $templateCache, $http, FilePanelFactory) {

    var currentNote
    var init = false
    var myCallback = null;

    return {

        hideShowPanel : (note) => {
            if(init == false) {
                init = true;   
                this.panel =  FilePanelFactory.getPanel();
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

    
.controller('fileCtrl',["$scope", "$mdDialog","FilePanelService","authService",function($scope,$mdDialog,FilePanelService,authService){

    let onChange = ()=> {
        let obj = FileSystem._objects[$scope.files._server_id]
        $scope.files = obj.get_obj()
        $scope.$apply();
    }


    FilePanelService.register((annotation) => {
        if($scope.files) {
            let obj = FileSystem._objects[$scope.files._server_id];
            if (obj)
                obj.unbind(onChange);
        }
        if(annotation) {
            $scope.files = annotation;
            let obj = FileSystem._objects[$scope.files._server_id];
            if(obj)
                obj.bind(onChange);
        }
    })


    $scope.user = authService.get_user();

    $scope.deleteFile = (file) => {
        console.log(file);
        var dialog = $mdDialog.confirm()
            .ok("Delete !")
            .title('Do you want to remove it?')
            .cancel('Cancel')
            .clickOutsideToClose(true);
        
            $mdDialog.show(dialog)
            .then((result) => {
                // for (let i = 0; i < this._file_selected.files.length; i++) {
                //     if(this._file_selected.files[i]._info.id == id) {
                //         this._file_selected.files.splice(i,1);
                //         break;
                //     }
                // }
                let mod = FileSystem._objects[$scope.files._server_id];

                if(mod) {
                    for (var i = 0; i < mod.files.length; i++) {
                        if(mod.files[i]._server_id == file._server_id) {
                            mod.files.splice(i,1);
                        } else {
                            console.log(mod.files[i]._server_id);
                            console.log(file._server_id);
                        }
                    }
                } else console.log("mod null")

            }, function(){});
    }

    $scope.downloadFile = (file) => {
        let mod = FileSystem._objects[$scope.files._server_id];

        for(let i = 0; i < mod.files.length; i++) {
            
            if(mod.files[i]._server_id == file._server_id) {
                selected.load( (model,error) => {
                    if(model instanceof Path) {
                    // window.open("/sceen/_?u=" + model._server_id, "Download");
                    var element = document.createElement('a');
                    element.setAttribute('href', "/sceen/_?u=" + model._server_id);
                    element.setAttribute('download', selected.name);

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                    }
                });
                break;
            }
        }
    }

    window.handle_files = (event) => {
        let mod = FileSystem._objects[$scope.files._server_id];
        var filePath;
        if(event.target) {
            if(mod) {
                for (let i = 0; i < event.target.files.length; i++) {
                    const element = event.target.files[i];
                    filePath = new Path(element);

                    mod.files.force_add_file(element.name,filePath);
                 $scope.$apply();   
                }
            }
        }
    }
    
}])
