

angular.module('app.spinalforge.plugin').run(["spinalModelDictionary", "$mdDialog", "$mdToast", "authService","$rootScope","$compile",
  function (spinalModelDictionary, $mdDialog,$mdToast, authService,$rootScope,$compile) {

    class PannelAnnotation {
      constructor(viewer, options) {
        Autodesk.Viewing.Extension.call(this, viewer, options);

        this.viewer = viewer;
        this.panel = null;
        this.user = authService.get_user();
        this.messagePanel;
        this.filePanel;

        $rootScope.exec_function = (name,param1 = null,param2 = null,param3 = null) => {
          switch (name) {
            case "createTheme":
              this.createTheme();
              break;

            case "addNote":
              this.createNote(param1);
              break;
            
            case "seeAnnotation":
              this.SeeAnnotation(param1);
              break;
            
              case "addItem":
              this.AddItems(param1,param2)
              break;
  
            case "changeColor":
              this.changeColorInHub(param1,param2,param3);
              break;
  
            case "view":
              this.viewOrHide(param1,param2);
              break;
  
            case "rename":
              this.renameNote(param1,param2);
              break;
  
            case "delete":
              this.deleteNoteItem(param1,param2,param3);
              break;

            case "info":
              this.viewMessagePanel(param1,param2);
              break;
            
            case "file":
              this.viewFilePanel(param1,param2);
              break;
            
            case "seeAll" :
              this.viewOrHideAllItem(param1);
              break;
  
            
            // case "settingAnnotation":
            //   this.settingAnnotation(params);
            //   break;
            // case "save" :
            //   this.saveModification(params,param2);
            //   break;
          }
        }

      }

      load() {
        if (this.viewer.toolbar) {
          this.createUI();
        } else {
          this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
          this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
        }
        return true;
      }

      onToolbarCreated() {
        this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
        this.onToolbarCreatedBinded = null;
        this.createUI();
      }

      unload() {
        this.viewer.toolbar.removeControl(this.subToolbar);
        return true;
      }

      createUI() {
        var title = 'Annotation';
        this.panel = new PanelClass(this.viewer, title);

        this.initialize();

        var button1 = new Autodesk.Viewing.UI.Button('Annotation');

        button1.onClick = (e) => {
          if (!this.panel.isVisible()) {
            this.panel.setVisible(true);
          } else {
            this.panel.setVisible(false);
          }
        };

        button1.addClass('fa');
        button1.addClass('fa-pencil');
        button1.addClass('fa-2x');
        button1.setToolTip('Annotation');

        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-Annotation');
        this.subToolbar.addControl(button1);
        this.viewer.toolbar.addControl(this.subToolbar);
      }

      initialize() {


        this.panel.initializeMoveHandlers(this.panel.container);
        // this.panel.container.appendChild(this.panel.createScrollContainer());
        var _container = angular.element(this.panel.container);

        spinalModelDictionary.init().then((m) => {
          if (m) {
            if (m.groupAnnotationPlugin) {
              m.groupAnnotationPlugin.load((mod) => {
                this.model = mod;
                this.func_success(this.model,_container);
              });
            } else {
              this.model = new Lst();
              m.add_attr({
                groupAnnotationPlugin : new Ptr(this.model)
              });
              this.func_success(this.model,_container);
            }

          }

        });
      }

      func_success(data,parent) {
        this.messagePanel = new MessagePanel(this.viewer,this.model,this.user);
        this.filePanel = new FilesPanel(this.viewer,this.model,this.user);
        var container = angular.element('<div class="_container"></div>');
        var addGroup = angular.element(`<md-button class="md-raised md-primary block" ng-click="exec_function('createTheme')">Create a group</md-button>`);

        var items = document.createElement('div');
        items.className = "themes";

        

        container.append(addGroup)
        
        data.bind(() => {
          items.innerHTML = "";
          this.displayTheme(items,container,data);
        })

        $compile(container)($rootScope);
        parent.append(container);

        var colors = document.getElementsByClassName("input_color");
        console.log("colors",colors)
        var _self = this;

        for (let i = 0; i < colors.length; i++) {
          colors[i].onchange = function() {
            _self.changeColorInHub(this.theme, this.name, this.value);
          }
          
        }

      }

      displayAnnotation(id) {

        var notes = this.model;
        var selected;


        var content = `<md-list class='md-list-item-text' id="a_${id}">`;
        
        for (let i = 0; i < notes.length; i++) {
          const element = notes[i];
          if(element.id == id) {
            selected = element;
            break;
          }
        }

        if(selected != null) {
          for (let j = 0; j < selected.listModel.length; j++) {
            const note = selected.listModel[j];

            content += `<md-list-item ng-click="" class="noright">
                <p class="noteTitle">${note.title.get()}</p>


                <md-button class="i_btn" aria-label="add_item" id=${note.id.get()} ng-click="exec_function('addItem','${selected.id.get()}','${note.id.get()}')">
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </md-button>

                <input class="i_btn input_color" value="${note.color.get()}" id="i_color" type='color' theme='${selected.id.get()}' name='${note.id.get()}'/>

                <md-button class="i_btn show${note.id.get()}" id='e_${note.id.get()}' aria-label="view" ng-click="exec_function('view','${selected.id.get()}','${note.id.get()}')" show="false">
                  <i class="fa fa-eye" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="rename" ng-click="exec_function('rename','${selected.id.get()}','${note.id.get()}')">
                  <i class="fa fa-pencil" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="delete" ng-click="exec_function('delete','${selected.id.get()}','${note.id.get()}')">
                  <i class="fa fa-trash" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="info" ng-click="exec_function('info','${selected.id.get()}','${note.id.get()}')">
                  <i class="fa fa-comment" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="info" ng-click="exec_function('file','${selected.id.get()}','${note.id.get()}')">
                  <i class="fa fa-paperclip" aria-hidden="true"></i>
                </md-button> 

            </md-list-item>`;
            
          }
        }
        
        content += `</md-list>`;

        return content;

      }

      displayTheme(parent,container,notes) {
        
        var content = angular.element(`<md-list></md-list>`);
        var div,element;

        if(notes.length > 0) {
          for (let i = 0; i < notes.length; i++) {
            element = notes[i];
            div = angular.element(`
              <md-list-item>   
                <p id='p_${element.id.get()}' show="false" ng-click="exec_function('seeAnnotation','${element.id.get()}')">
                  <i class="fa fa-caret-right"></i>
                  &nbsp;
                  ${element.name.get()}
                </p>

                <md-button class="i_btn" aria-label="add_item" id=${element.id.get()} ng-click="exec_function('addNote','${element.id.get()}')">
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn show${element.id.get()}" id='th_${element.id.get()}' aria-label="view" show="false" ng-click="exec_function('seeAll','${element.id.get()}')">
                  <i class="fa fa-eye" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${element.id.get()} aria-label="rename" ng-click="exec_function('rename','${element.id.get()}')">
                  <i class="fa fa-pencil" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${element.id.get()} aria-label="delete" ng-click="exec_function('delete','${element.id.get()}')">
                  <i class="fa fa-trash" aria-hidden="true"></i>
                </md-button>

              </md-list-item>

              ${this.displayAnnotation(element.id.get())}
            `);
              
            content.append(div);

          }
        } else {
          content.append('<h1>No note created ! create one</h1>');
        }
        var _parent = angular.element(parent);
        var c = angular.element(content);
        _parent.append(c);
        $compile(c)($rootScope);

        container.append(_parent);

        // var annotationSelected = angular.element('<div class="item_selected"></div>')
        // container.append(annotationSelected);

      }

      createTheme() {
        var notes = this.model;
        var theme = new ThemeModel();

        theme.id.set(newGUID());
        theme.creation.set(Date.now());
        theme.owner.set(this.user.id);
        theme.username.set(this.user.username);

        var confirm = $mdDialog.prompt()
          .title('Theme')
          .placeholder('Please enter the theme')
          .ariaLabel('New Theme')
          .clickOutsideToClose(true)
          .required(true)
          .ok('create!')
          .cancel('Cancel')
        
          $mdDialog.show(confirm).then((result) => {
            theme.name.set(result);

            notes.push(theme);

            console.log(this.model)

          },function(){})

      }

      createNote(id){
        var notes = this.model;
        var selected;

        for (let i = 0; i < notes.length; i++) {
          const element = notes[i];
          if(element.id == id) {
            selected = element;
            break;
          }
          
        }

        var noteModel = new NoteModel();

        noteModel.id.set(newGUID());
        noteModel.owner.set(this.user.id);
        noteModel.username.set(this.user.username);
        noteModel.date.set(Date.now());
        noteModel.color.set("#000000");

        var confirm = $mdDialog.prompt()
          .title('Note')
          .placeholder('Note name')
          .ariaLabel('New Note')
          .clickOutsideToClose(true)
          .required(true)
          .ok('create')
          .cancel('Cancel')
        
        $mdDialog.show(confirm).then((result) => {
          noteModel.title.set(result);

          selected.listModel.push(noteModel);

        },function(){})
        

      }

      SeeAnnotation(id) {
        var p_div = document.getElementById("p_" + id);
        var annot_div = document.getElementById("a_" + id);
        var icon = p_div.getElementsByTagName('i')[0];


        if(p_div.getAttribute("show") == "false") {
          annot_div.style.display = "block";
          p_div.setAttribute('show','true');
          icon.setAttribute('class','fa fa-caret-down')
        } else {
          annot_div.style.display = "none";
          p_div.setAttribute('show','false');
          icon.setAttribute('class','fa fa-caret-right')
        }
        
      }

      viewOrHideAllItem(themeId) {
        var theme = document.getElementById("th_" + themeId);

        if(theme.getAttribute("show") == "false") {
          theme.innerHTML = '<i class="fa fa-eye-slash"></i>'
          theme.setAttribute('show','true');
          this.changeAllItemsColor(themeId);
          this.changeAllAnnotationIcon(themeId,"false");
        } else {
          theme.innerHTML = '<i class="fa fa-eye"></i>'
          theme.setAttribute('show','false');
          this.restoreAllItemsColor(themeId);
          this.changeAllAnnotationIcon(themeId,"true");
        }

      }

      getAllAnnotationId(themeId) {
        var objects = [];
        var _selected;
        var notes = this.model;

        for(var i = 0; i < notes.length; i++) {
          if(notes[i].id == themeId) {
            _selected = notes[i];
            for (var i = 0; i < _selected.listModel.length; i++) {
              var ids = [];
              var color;
              for (var j = 0; j < _selected.listModel[i].allObject.length; j++) {
                ids.push(_selected.listModel[i].allObject[j].dbId.get());
              }
              color = _selected.listModel[i].color.get();

              objects.push({
                ids: ids,
                color: color,
                id: _selected.listModel[i].id
              });

              
            }
            return objects;
          }
        }
      
      }

      changeAllItemsColor(themeId) {
        var objects = this.getAllAnnotationId(themeId);

        this.viewer.colorAllMaterials(objects);

      }

      restoreAllItemsColor(themeId) {
        var objects = this.getAllAnnotationId(themeId);

        this.viewer.restoreAllMaterialColor(objects);
      }

      changeAllAnnotationIcon(themeId,show) {
        var notes = this.model;

        for (let i = 0; i < notes.length; i++) {
          const note = notes[i];
          if(note.id == themeId) {
            for (let j = 0; j < note.listModel.length; j++) {
              const annotation = note.listModel[j];
              var doc = document.getElementById("e_" + annotation.id.get());
              
              if(show == "false") {
                doc.innerHTML = '<i class="fa fa-eye-slash"></i>';
                doc.setAttribute('show','true');
              } else {
                doc.innerHTML = '<i class="fa fa-eye"></i>';
                doc.setAttribute('show','false');
              }
              
            }
          }
          
        }

      }

      verifyIcon(themeId) {
        var notes = this.model;

        for (let i = 0; i < notes.length; i++) {
          const note = notes[i];
          if(note.id == themeId) {
            for (let j = 0; j < note.listModel.length; j++) {
              const annotation = note.listModel[j];

              var doc = document.getElementById("e_" + annotation.id);

              if(doc.getAttribute("show") == "false") {
                return false;
              }
              
            }
            return true;
          }
          
        }

      }

      // settingAnnotation(id) {
      //   var notes = this.model;
      //   var liste = id.split("/");
      //   var themeId = liste[0];
      //   var annotationId = liste[1];
      //   // var sel;
      //   // var themeName;

      //   $rootScope.themeName;
      //   $rootScope.annotationSelected;
      //   var name;


      //   for (let i = 0; i < notes.length; i++) {
      //     const element = notes[i];
      //     if(element.id == themeId) {
      //       $rootScope.themeName = element.name.get();
      //       for (let j = 0; j < element.listModel.length; j++) {
      //         const annotation = element.listModel[j];
      //         if(annotation.id == annotationId) {
      //           // sel = annotation;
      //           $rootScope.annotationSelected = annotation;
      //           break;
      //         }
              
      //       }
      //       break;
      //     }
          
      //   }

      //   name = $rootScope.annotationSelected.title;

      //   var divSelect = document.getElementsByClassName("item_selected")[0];
      //   divSelect.innerHTML = "";

      //   var container = angular.element(divSelect);

      //   var div = angular.element(`
      //     <h1>{{themeName | uppercase}} > ${name}</h1>
      //     <br />
      //     <div layout="column" class="md-inline-form">
      //       <md-input-container class="md-block">
      //         <label>Name</label>
      //         <input id="_input" ng-model="annotationSelected.title" placeholder="title" ng-click="focus_input()">
      //       </md-input-container>

      //       <md-input-container class="md-block">
      //         <label>Color</label>
      //         <input ng-model="annotationSelected.color" type="color" placeholder="title">
      //       </md-input-container>

      //       <md-button class="md-raised md-primary block" ng-click="exec_function('save',annotationSelected, '${themeId}')">Save</md-button>

      //     </div>


      //   `);

      //   container.append(div);

      //   $compile(container)($rootScope);
        

      // }

      // saveModification(annotation,themeId) {
      //   var notes = this.model;

      //   for (let i = 0; i < notes.length; i++) {
      //     const element = notes[i];
      //     if(element.id == themeId) {
      //       for (let j = 0; j < element.listModel.length; j++) {
      //         const annotation = element.listModel[j];
      //         if(annotation.id == annotation.id) {
      //           notes[i].listModel[j].mod_attr(annotation);
      //           break;
      //         }
              
      //       }
      //       break;
      //     }
          
      //   }

      // }




      //---------------------------------------------------- Annotation functions ------------------------------

      AddItems(themeId,annotationId) {
        var noteSelected, indexTheme,indexNote;
        var items = this.viewer.getSelection();
        var notes = this.model;
  
  
        if (items.length == 0) {
          alert('No model selected !');
          return;
        }
  
        this.viewer.model.getBulkProperties(items, {
          propFilter: ['name']
        }, (models) => {
  
          for (var i = 0; i < notes.length; i++) {
            if (notes[i].id == themeId) {
              indexTheme = i;
              for (let j = 0; j < notes[i].listModel.length; j++) {
                const element = notes[i].listModel[j];
                if(element.id == annotationId) {
                  indexNote = j;
                  noteSelected = notes[i].listModel[j].allObject;
                  break;
                }
                
              }
              break;
              
            }
          }
  
          for (var j = 0; j < models.length; j++) {
            noteSelected.push(models[j]);
          }

          notes[indexTheme].listModel[indexNote].allObject = noteSelected;
  
          var toast = $mdToast.simple()
          .content("Item added !")
          .action('OK')
          .highlightAction(true)
          .hideDelay(0)
          .position('bottom right')
          .parent("body");
  
          $mdToast.show(toast);
        }, function () {
          console.log("error");
        });
  
  
      }


      changeColorInHub(themeId,annotationId,color) {
      
        console.log("themeId", themeId);
        console.log("annotationId", annotationId);
        console.log("color", color);

        var noteSelected, indexNote, indexTheme;
        var notes = this.model;
  
        for (var i = 0; i < notes.length; i++) {
          if (notes[i].id == themeId) {
            for (let j = 0; j < notes[i].listModel.length; j++) {
              const element = notes[i].listModel[j];

              if(element.id == annotationId) {
                notes[i].listModel[j].color.set(color);
                break;
              }
              
            }
            break;
          }
        }
      }


      getItemsId(themeId,annotationId) {
        var ids = [];
        var selected;
        var notes = this.model;

        for (var i = 0; i < notes.length; i++) {
          if (notes[i].id == themeId) {
            for (let k = 0; k < notes[i].listModel.length; k++) {
              const element = notes[i].listModel[k];

              if(element.id == annotationId) {
                selected = notes[i].listModel[k];
                break;
              }
              
            }
            break;
          }
        }


        for (var j = 0; j < selected.allObject.length; j++) {
          ids.push(selected.allObject[j].dbId.get());
        }
        return {ids : ids, selected : selected};
      }
  

      changeItemColor(themeId, annotationId) {
        
        var idsList = this.getItemsId(themeId,annotationId);

        this.viewer.setColorMaterial(idsList.ids, idsList.selected.color, idsList.selected.id);

        var doc = document.getElementById("th_" + themeId)

        if(this.verifyIcon(themeId)) {
          doc.setAttribute('show','true');
          doc.innerHTML = '<i class="fa fa-eye-slash"></i>'
        } else {
          doc.setAttribute('show','false');
          doc.innerHTML = '<i class="fa fa-eye"></i>'
        }

      }

      restoreColor(themeId,annotationId) {
        var idsList = this.getItemsId(themeId, annotationId);
        this.viewer.restoreColorMaterial(idsList.ids,idsList.selected.id);

        var doc = document.getElementById("th_" + themeId)

        if(!this.verifyIcon(themeId)) {
          doc.setAttribute('show','true');
          doc.innerHTML = '<i class="fa fa-eye-slash"></i>'
        } else {
          doc.setAttribute('show','false');
          doc.innerHTML = '<i class="fa fa-eye"></i>'
        }

      }

      deleteNoteItem(themeId,annotationId,item) {

        var notes = this.model;
  
        var dialog = $mdDialog.confirm()
              .ok("Delete !")
              .title('Do you want to remove it?')
              .cancel('Cancel')
              .clickOutsideToClose(true);
        
              $mdDialog.show(dialog)
              .then((result) => {
                var themeIndex,annotationIndex;

                for (let i = 0; i < notes.length; i++) {
                  if(notes[i].id == themeId) {
                    themeIndex = i;
                    for(var j = 0; j < notes[i].listModel.length; j++){
                      if(notes[i].listModel[j].id == annotationId) {
                        annotationIndex = j;
                        break;
                      }  
                    }
                    break;
                  }
                    
                }

                if(item != null) {
                  for (let index = 0; index < notes[themeIndex].listModel[annotationIndex].allObject.length; index++) {
                    const element = notes[themeIndex].listModel[annotationIndex].allObject[index]
                    if(element.dbId == item) {
                      notes[themeIndex].listModel[annotationIndex].allObject.splice(index,1);
                      break;
                    } 
                  }
                } else if(item == null && annotationId != null) {
                  notes[themeIndex].listModel.splice(annotationIndex,1);
                } else {
                  notes.splice(themeIndex,1);
                }
  
              }, function(){});
  
      }

      renameNote(themeId,annotationId) {
        var notes = this.model;
  
        var confirm = $mdDialog.prompt()
              .title('Rename Note')
              .placeholder('Please enter the title')
              .ariaLabel('Rename')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Rename')
              .cancel('Cancel');

              $mdDialog.show(confirm).then((result) => {
                var themeIndex;

                for (let i = 0; i < notes.length; i++) {
                  if(notes[i].id == themeId) {
                      themeIndex = i;
                      break;
                  } 
                }

                if(annotationId != null) {
                  for (let j = 0; j < notes[themeIndex].listModel.length; j++) {
                    const element = notes[themeIndex].listModel[j];
                    if(element.id == annotationId) {
                      notes[themeIndex].listModel[j].title.set(result);
                      break;
                    }   
                  }
                } else {
                  notes[themeIndex].name.set(result);
                }

              }, function () {});
      }

      viewOrHide(themeId, annotationId) {

        var element = document.getElementsByClassName("show" + annotationId)[0];
        var show = element.getAttribute("show");
  
        if(show == "false") {
          element.setAttribute("show","true");
          this.changeItemColor(themeId, annotationId);
          element.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
        } else {
          this.restoreColor(themeId, annotationId);
          element.setAttribute("show","false");
          element.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
          
        }
  
      }

      //------------------------------------------------------ Pannel Message -------------------------------------
      viewMessagePanel(themeId,annotationId) {
        this.messagePanel.DetailPanel(themeId,annotationId);
      }

      //----------------------------------------------------- -- Panel File ---------------------------------------
      viewFilePanel(themeId,annotationId) {
        this.filePanel.DisplayFilePanel(themeId,annotationId);
      }



    } // end class
    
  Autodesk.Viewing.theExtensionManager.registerExtension('PannelAnnotation', PannelAnnotation);
  } // end run
]);