
angular.module('app.spinalforge.plugin').run(["spinalModelDictionary", "$mdDialog", "$mdToast", "authService","$rootScope","$compile",
  function (spinalModelDictionary, $mdDialog,$mdToast, authService,$rootScope,$compile) {

    class PannelAnnotation {
      constructor(viewer, options) {
        Autodesk.Viewing.Extension.call(this, viewer, options);

        this.viewer = viewer;
        this.panel = null;
        this.user = authService.get_user();

        $rootScope.exec_function = (name,params = null) => {
          switch (name) {
            case "createTheme":
              this.createTheme();
              break;
            case "addNote":
              this.createNote(params);
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

      displayTheme(parent,container,notes) {
        
        var content = angular.element(`<md-list></md-list>`);
        var div,element;

        if(notes.length > 0) {
          for (let i = 0; i < notes.length; i++) {
            element = notes[i];
            div = angular.element(`
              <md-list-item>
                <p>${element.name.get()}</p>

                <md-button class="i_btn" aria-label="add_item" id=${element.id.get()} ng-click="exec_function('addNote','${element.id.get()}')">
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </md-button>
              </md-list-item>
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

    } // end class
    
  Autodesk.Viewing.theExtensionManager.registerExtension('PannelAnnotation', PannelAnnotation);
  } // end run
]);