
angular.module('app.spinalforge.plugin').run(["spinalModelDictionary", "$mdDialog", "$mdToast", "authService","$rootScope","$compile",
  function (spinalModelDictionary, $mdDialog,$mdToast, authService,$rootScope,$compile) {

    class PannelAnnotation {
      constructor(viewer, options) {
        Autodesk.Viewing.Extension.call(this, viewer, options);

        this.viewer = viewer;
        this.panel = null;
        this.user = authService.get_user();

        $rootScope.focus_input = function() {
          var input = document.getElementById("_input");
          input.focus();
        }
        $rootScope.exec_function = (name,params = null,param2) => {
          switch (name) {
            case "createTheme":
              this.createTheme();
              break;
            case "addNote":
              this.createNote(params);
              break;
            case "seeAnnotation":
              this.SeeAnnotation(params);
              break;
            case "settingAnnotation":
              this.settingAnnotation(params);
              break;
            case "save" :
              this.saveModification(params,param2);
              break;
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

              
                <md-button class="i_btn" aria-label="add_item" id=${note.id.get()} ng-click="exec_function('settingAnnotation','${selected.id.get()}/${note.id.get()}')">
                  <i class="fa fa-wrench" aria-hidden="true"></i>
                </md-button>

              <!-- 
                <input class="i_btn input_color" value="${note.color.get()}" id="i_color" type='color' name='${note.id.get()}'/>

                <md-button class="i_btn show${note.id.get()}" id=${note.id.get()} aria-label="view" show="false">
                  <i class="fa fa-eye" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="rename">
                  <i class="fa fa-pencil" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="delete">
                  <i class="fa fa-trash" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="info">
                  <i class="fa fa-comment" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${note.id.get()} aria-label="info">
                  <i class="fa fa-paperclip" aria-hidden="true"></i>
                </md-button> 
              -->

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

                <md-button class="i_btn show${element.id.get()}" id=${element.id.get()} aria-label="view" show="false">
                  <i class="fa fa-eye" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${element.id.get()} aria-label="rename">
                  <i class="fa fa-pencil" aria-hidden="true"></i>
                </md-button>

                <md-button class="i_btn" id=${element.id.get()} aria-label="delete">
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

        var annotationSelected = angular.element('<div class="item_selected"></div>')
        container.append(annotationSelected);

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

      settingAnnotation(id) {
        var notes = this.model;
        var liste = id.split("/");
        var themeId = liste[0];
        var annotationId = liste[1];
        // var sel;
        // var themeName;

        $rootScope.themeName;
        $rootScope.annotationSelected;
        var name;


        for (let i = 0; i < notes.length; i++) {
          const element = notes[i];
          if(element.id == themeId) {
            $rootScope.themeName = element.name.get();
            for (let j = 0; j < element.listModel.length; j++) {
              const annotation = element.listModel[j];
              if(annotation.id == annotationId) {
                // sel = annotation;
                $rootScope.annotationSelected = annotation;
                break;
              }
              
            }
            break;
          }
          
        }

        name = $rootScope.annotationSelected.title;

        var divSelect = document.getElementsByClassName("item_selected")[0];
        divSelect.innerHTML = "";

        var container = angular.element(divSelect);

        var div = angular.element(`
          <h1>{{themeName | uppercase}} > ${name}</h1>
          <br />
          <div layout="column" class="md-inline-form">
            <md-input-container class="md-block">
              <label>Name</label>
              <input id="_input" ng-model="annotationSelected.title" placeholder="title" ng-click="focus_input()">
            </md-input-container>

            <md-input-container class="md-block">
              <label>Color</label>
              <input ng-model="annotationSelected.color" type="color" placeholder="title">
            </md-input-container>

            <md-button class="md-raised md-primary block" ng-click="exec_function('save',annotationSelected, '${themeId}')">Save</md-button>

          </div>


        `);

        container.append(div);

        $compile(container)($rootScope);
        

      }

      saveModification(annotation,themeId) {
        var notes = this.model;

        for (let i = 0; i < notes.length; i++) {
          const element = notes[i];
          if(element.id == themeId) {
            for (let j = 0; j < element.listModel.length; j++) {
              const annotation = element.listModel[j];
              if(annotation.id == annotation.id) {
                notes[i].listModel[j].mod_attr(annotation);
                break;
              }
              
            }
            break;
          }
          
        }

      }


    } // end class
    
  Autodesk.Viewing.theExtensionManager.registerExtension('PannelAnnotation', PannelAnnotation);
  } // end run
]);