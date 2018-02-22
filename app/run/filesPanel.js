
angular.module('app.spinalforge.plugin').run(["$mdDialog", "$mdToast","$rootScope","$compile",
function ($mdDialog,$mdToast, $rootScope,$compile) {
    window.FilesPanel = class FilesPanel {
        constructor(viewer,notes,user){
            this.viewer = viewer;
            this.filePanel = null;
            this.filePanelContent = null;
            this.model = notes;
            this.user = user;
            this._file_selected = null;

            $rootScope.execute_func = (name,id) => {
                switch (name) {
                    case "delete_file":
                        this.RemoveFile(id);
                        break;
                
                    case "download_file":
                    this.DownloadFile(id)
                        break;
                }
            }
        }

        DownloadFile(id) {
            var selected;
            for(let i = 0; i < this._file_selected.files.length; i++) {
                selected = this._file_selected.files[i];
                if(selected._info.id == id) {
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


        RemoveFile(id) {
            var dialog = $mdDialog.confirm()
            .ok("Delete !")
            .title('Do you want to remove it?')
            .cancel('Cancel')
            .clickOutsideToClose(true);
        
            $mdDialog.show(dialog)
            .then((result) => {
                for (let i = 0; i < this._file_selected.files.length; i++) {
                    if(this._file_selected.files[i]._info.id == id) {
                        this._file_selected.files.splice(i,1);
                        break;
                    }
                }
            }, function(){});
        }


        handle_files(files) {
            var file,filePath,mod_file;

            if(files.length > 0) {
                for(let i = 0; i < files.length; i++) {
                    filePath = new Path(files[i]);

                    this._file_selected.files.force_add_file(files[i].name,filePath,{id : newGUID()})
                }
            }
        }

        DisplayFilePanel(themeId, annotationId) {
            var notes = this.model;

            if(this.filePanel == null) {
                this.filePanel = new PanelClass(this.viewer,annotationId);
                this.filePanel.initializeMoveHandlers(this.filePanel.container);
                this.filePanel.container.appendChild(this.filePanel.createCloseButton());
                this.filePanel.container.style.right = "0px";
                this.filePanel.container.style.width = "400px";
                this.filePanel.container.style.height = "600px";
                this.filePanel.container.padding = "0px";
                // }

                // if(this.filePanelContent == null) {
                this.filePanelContent = document.createElement('div');
                this.filePanelContent.className = "file_panel_content";

                var dragDrop = document.createElement('div');
                dragDrop.className = "dragDrop";
                
                var input = document.createElement('input');
                input.type = 'file';
                input.id = "modal-new-dropzone-input";
                input.setAttribute("multiple","true");
                input.className = "modal-new-dropzone-input";

                input.onchange = () => {
                    return this.handle_files(input.files);
                }

                var file_container = document.createElement('label');
                file_container.innerHTML = `
                                    <span class="modal-new-span-upload">
                                        click to Choose files to upload or Drop them here
                                    </span>
                                    <ul id="modal-new-list-upload"></ul>`;

                file_container.className = "text-center"

                file_container.ondrop = (evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();

                    this.handle_files(evt.dataTransfer.files);
                }

                file_container.ondragover = (evt) => {
                    evt.preventDefault();
                }

                file_container.htmlFor = "modal-new-dropzone-input"


                dragDrop.appendChild(input);
                dragDrop.appendChild(file_container);
                
                
                this.filePanelContent.appendChild(dragDrop);

                var files_div = document.createElement('div');
                files_div.className = 'files_div';

                this.filePanelContent.appendChild(files_div);
                this.filePanel.container.appendChild(this.filePanelContent);
            
            }
            

            
            this.filePanel.setVisible(true);
            

            for (let index = 0; index < notes.length; index++) {
                if(notes[index].id == themeId){
                    for (let i = 0; i < notes[index].listModel.length; i++) {
                        if(notes[index].listModel[i].id == annotationId){
                            this._file_selected = notes[index].listModel[i];
                            break;
                        }      
                    }
                    
                    break;
                }   
            }

            this.filePanel.setTitle(this._file_selected.title.get());

            notes.bind(() => {
                this.files_display();
            })

        }


        displayItem(_file,parent) {
            var items = `<md-list-item>
                        <p class="noteTitle">${_file.name.get()}</p>

                        <md-button class="i_btn" aria-label="add_item" id=${_file._info.id.get()} ng-click="execute_func('delete_file','${_file._info.id.get()}')">
                            <i class="fa fa-trash" aria-hidden="true"></i>
                        </md-button>

                        <md-button class="i_btn" aria-label="add_item" id=${_file._info.id.get()} ng-click="execute_func('download_file','${_file._info.id.get()}')">
                            <i class="fa fa-download" aria-hidden="true"></i>
                        </md-button>
                    </md-list-item>`; 

            var content = angular.element(items);

            parent.append(content);
            $compile(content)($rootScope);
        }

        files_display() {

            var files = document.getElementsByClassName("files_div")[0];
            files.innerHTML = "";

            var contener = angular.element(files);

            var div = angular.element('<md-list>\
                </md-list>');


            contener.append(div);
            $compile(div)($rootScope);

            var _file;

            for (let i = 0; i < this._file_selected.files.length; i++) {
                _file = this._file_selected.files[i];
                this.displayItem(_file,div);
            }

        }

    }

}]);