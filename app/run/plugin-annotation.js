let appSpinalforgePlugin = angular.module('app.spinalforge.plugin');
appSpinalforgePlugin.run(["$rootScope", "$compile", "$templateCache", "$http", "spinalRegisterViewerPlugin",
    function ($rootScope, $compile, $templateCache, $http, spinalRegisterViewerPlugin) {
      spinalRegisterViewerPlugin.register("PannelAnnotation");
      // var extensions = ['PannelAnnotation', "Autodesk.ADN.Viewing.Extension.Color"];

      let load_template = (uri, name) => {
        $http.get(uri).then((response) => {
          $templateCache.put(name, response.data);
        }, (errorResponse) => {
          console.log('Cannot load the file ' + uri);
        });
      };
      let toload = [{
        uri: 'app/templates/annotationTemplate.html',
        name: 'annotationTemplate.html'
      }, {
        uri: 'app/templates/commentTemplate.html',
        name: 'commentTemplate.html'
      }];
      for (var i = 0; i < toload.length; i++) {
        load_template(toload[i].uri, toload[i].name);
      }

      // window.CommentPanel = class CommentPanel {
      //   constructor() {
      //               this.panel = new PanelClass(this.viewer, title);
      //               var _container = document.createElement('div');
      //               _container.style.height = "calc(100% - 45px)";
      //               _container.style.overflowY = 'auto';
      //               this.panel.container.appendChild(_container);

      //               $(_container).html("<div ng-controller=\"commentCtrl\" ng-cloak>" +
      //                 $templateCache.get("commentTemplate.html") + "</div>");
      //               $compile($(_container).contents())($rootScope);


      //   }
      // }

      class PannelAnnotation {
        constructor(viewer, options) {
          Autodesk.Viewing.Extension.call(this, viewer, options);
          this.viewer = viewer;
          this.panel = null;
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

          this.subToolbar = this.viewer.toolbar.getControl("my-Annotation");
          if (!this.subToolbar) {
            this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-Annotation');
            this.viewer.toolbar.addControl(this.subToolbar);
          }
          this.subToolbar.addControl(button1);
          this.initialize();
        }

        initialize() {
          // new CommentPanel()

          var _container = document.createElement('div');
          _container.style.height = "calc(100% - 45px)";
          _container.style.overflowY = 'auto';
          this.panel.container.appendChild(_container);

          $(_container).html("<div ng-controller=\"annotationCtrl\" ng-cloak>" +
            $templateCache.get("annotationTemplate.html") + "</div>");
          $compile($(_container).contents())($rootScope);
        }
      } // end class
      Autodesk.Viewing.theExtensionManager.registerExtension('PannelAnnotation', PannelAnnotation);
    } // end run
  ])

  //---------------------------------------------------------------------------------------------------------


  .controller('annotationCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "messagePanelService", "FilePanelService",
    function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, messagePanelService, FilePanelService) {
      var viewer = v;
      $scope.user = authService.get_user();
      $scope.headerBtnClick = (btn) => {
        console.log("headerBtnClick");
        console.log(btn);

        if (btn.label == "add theme") {
          $scope.addTheme();
        }
      };

      $scope.headerBtn = [{
          label: "add theme",
          icon: "note_add"
        }
        // ,
        // {
        //   label: "visibility",
        //   icon: "visibility",
        //   toggleIcon: ""
        // },
        // {
        //   label: "visibility cancel",
        //   icon: "visibility_off"
        // },
      ];
      $scope.currentVisibleObj = [];

      $scope.themes = [];
      spinalModelDictionary.init().then((m) => {
        if (m) {
          if (m.groupAnnotationPlugin) {
            m.groupAnnotationPlugin.load((mod) => {
              $scope.themeListModel = mod;
              $scope.themeListModel.bind($scope.onModelChange);
            });
          } else {
            $scope.themeListModel = new Lst();
            m.add_attr({
              groupAnnotationPlugin: new Ptr($scope.themeListModel)
            });
            $scope.themeListModel.bind($scope.onModelChange);
          }
        }
      });

      function deferObjRdy(model, promise) {
        console.log(model, model._server_id);
        if (!model._server_id || FileSystem._tmp_objects[model._server_id]) {
          setTimeout(() => {
            deferObjRdy(model, promise);
          }, 200);
          return;
        }
        promise.resolve(model);
      }

      $scope.waitObjRdy = (model) => {
        let deferred = $q.defer();
        deferObjRdy(model, deferred);
        return deferred.promise;
      };

      $scope.onModelChange = () => {
        let promiseLst = [];
        for (var i = 0; i < $scope.themeListModel.length; i++) {
          let note = $scope.themeListModel[i];
          promiseLst.push($scope.waitObjRdy(note));
        }
        $q.all(promiseLst).then((res) => {
          $scope.themes = [];
          for (var i = 0; i < $scope.themeListModel.length; i++) {
            let note = $scope.themeListModel[i];
            let mod = note.get_obj();
            mod._server_id = note._server_id;
            $scope.themes.push(mod);
            if ($scope.selectedNote && $scope.selectedNote._server_id == mod._server_id) {
              $scope.selectedNote = mod;
            }
            // $scope.$apply();

            // chcck if aplly color
          }

          // messagePanelService.

        });

      };

      $scope.addTheme = () => {
        $mdDialog.show($mdDialog.prompt()
            .title("Add Theme")
            .placeholder('Please enter the Name')
            .ariaLabel('Add Theme')
            .clickOutsideToClose(true)
            .required(true)
            .ok('Confirm').cancel('Cancel'))
          .then(function (result) {
            var newTheme = new ThemeModel();
            newTheme.name.set(result);
            newTheme.owner.set($scope.user.id);
            newTheme.username.set($scope.user.username);

            $scope.themeListModel.push(newTheme);

          }, () => {});
      }

      $scope.$on('colorpicker-closed', function (data1, data2) {

        console.log(data1);
        console.log(data2);

        // update moedels via $scope.themes
        for (var i = 0; i < $scope.themes.length; i++) {
          let note = $scope.themes[i];
          for (var j = 0; j < note.listModel.length; j++) {
            let annotation = note.listModel[j];

            let mod = FileSystem._objects[annotation._server_id];


            if (mod) {
              mod.color.set(annotation.color);
            }
          }
        }
      });

      $scope.selectedNote = null;

      $scope.selectedStyle = (note) => {
        if (note.listModel) {

        }
        return note === $scope.selectedNote ? "background-color: #4185f4" : '';
      };

      $scope.getViewIcon = (note) => {

        return note.display ? "fa-eye-slash" : "fa-eye";
      };

      $scope.selectNote = (note) => {
        $scope.selectedNote = note;
      };

      $scope.renameNote = (note) => {
        $mdDialog.show($mdDialog.prompt()
            .title("Rename")
            .placeholder('Please enter the title')
            .ariaLabel('Rename')
            .clickOutsideToClose(true)
            .required(true)
            .ok('Confirm').cancel('Cancel'))
          .then(function (result) {
            let mod = FileSystem._objects[note._server_id];

            console.log(mod);

            if (mod) {
              if (mod.title)
                mod.title.set(result);
              else {
                mod.name.set(result);
              }
            }
          }, () => {});
      };

      $scope.ViewAllNotes = (theme) => {

        if (theme.display) {
          $scope.restoreColor(theme);
        } else {
          $scope.changeItemColor(theme);
        }

        // theme.display = !theme.display;

      };

      $scope.addNoteInTheme = (theme) => {
        $mdDialog.show($mdDialog.prompt()
            .title("Add Note")
            .placeholder('Please enter the title')
            .ariaLabel('Add Note')
            .clickOutsideToClose(true)
            .required(true)
            .ok('Confirm')
            .cancel('Cancel')
          )
          .then(function (result) {
            let mod = FileSystem._objects[theme._server_id];


            var annotation = new NoteModel();

            annotation.title.set(result);
            annotation.color.set('#000000');
            annotation.owner.set($scope.user.id);
            annotation.username.set($scope.user.username);


            if (mod) {
              mod.listModel.push(annotation);
            } else {
              console.log("mod null");
            }

          }, () => {
            console.log("canceled")
          });
      };

      $scope.deleteNote = (theme, note = null) => {
        console.log(note);
        var dialog = $mdDialog.confirm()
          .ok("Delete !")
          .title('Do you want to remove it?')
          .cancel('Cancel')
          .clickOutsideToClose(true);

        $mdDialog.show(dialog)
          .then((result) => {

            if (note != null) {
              for (var i = 0; i < $scope.themeListModel.length; i++) {
                var themeS = $scope.themeListModel[i];
                if (themeS._server_id == theme._server_id) {
                  for (var j = 0; j < themeS.listModel.length; j++) {
                    var annotation = themeS.listModel[j];

                    if (annotation._server_id == note._server_id) {
                      $scope.themeListModel[i].listModel.splice(j, 1);
                      break;
                    }
                  }
                  break;
                }
              }
            } else {
              for (var _i = 0; _i < $scope.themeListModel.length; _i++) {
                var _themeS = $scope.themeListModel[_i];
                if (_themeS._server_id == theme._server_id) {
                  $scope.themeListModel.splice(_i, 1);
                  break;
                }
              }
            }



          }, () => {})
      };


      $scope.addItemInNote = (annotation) => {

        var items = viewer.getSelection();

        if (items.length == 0) {
          alert('No model selected !');
          return;
        }

        viewer.model.getBulkProperties(items, {
          propFilter: ['name']
        }, (models) => {

          let mod = FileSystem._objects[annotation._server_id];

          if (mod) {
            for (var i = 0; i < models.length; i++) {
              mod.allObject.push(models[i]);
            }

            var toast = $mdToast.simple()
              .content("Item added !")
              .action('OK')
              .highlightAction(true)
              .hideDelay(0)
              .position('bottom right')
              .parent("body");

            $mdToast.show(toast);

          }

        })

      }


      $scope.changeItemColor = (theme) => {
        var ids = [];
        // var selected;
        // var notes = this.model;
        // for (var i = 0; i < notes.length; i++) {
        //   if (notes[i].id == id) {
        //     selected = notes[i];
        //     for (var j = 0; j < selected.allObject.length; j++) {

        //       ids.push(selected.allObject[j].dbId.get());
        //     }
        //   }
        // }

        let mod = FileSystem._objects[theme._server_id];

        if (mod) {
          for (var i = 0; i < mod.allObject.length; i++) {
            ids.push(mod.allObject[i]);
          }

          mod.display.set(true);

          console.log(mod.color);

          viewer.setColorMaterial(ids, theme.color, mod._server_id);
        }
      }


      $scope.restoreColor = (theme) => {
        var ids = [];
        // var selected;
        // var notes = this.model;
        // for (var i = 0; i < notes.length; i++) {
        //   if (notes[i].id == id) {
        //     selected = notes[i];
        //     for (var j = 0; j < selected.allObject.length; j++) {
        //       ids.push(selected.allObject[j].dbId.get());
        //     }
        //   }
        // }

        let mod = FileSystem._objects[theme._server_id];

        if (mod) {
          for (var i = 0; i < mod.allObject.length; i++) {
            ids.push(mod.allObject[i]);
          }

          mod.display.set(false);

          viewer.restoreColorMaterial(ids, mod._server_id);
        }

      }


      $scope.commentNote = (theme) => {
        messagePanelService.hideShowPanel(theme);
      };

      $scope.sendFile = (theme) => {
        FilePanelService.hideShowPanel(theme);
      }



      // changeAllItemsColor() {
      //   var objects = [];
      //   var notes = this.model;
      //   for (var i = 0; i < notes.length; i++) {
      //     var ids = [];
      //     var color;
      //     for (var j = 0; j < notes[i].allObject.length; j++) {
      //       ids.push(notes[i].allObject[j].dbId.get());
      //     }
      //     color = notes[i].color.get();
      //     objects.push({
      //       ids: ids,
      //       color: color,
      //       id: notes[i].id
      //     });
      //   }
      //   this.viewer.colorAllMaterials(objects);
      // }

      // restoreAllItemsColor() {
      //   var objects = [];
      //   var notes = this.model;
      //   for (var i = 0; i < notes.length; i++) {
      //     var ids = [];

      //     for (var j = 0; j < notes[i].allObject.length; j++) {
      //       ids.push(notes[i].allObject[j].dbId.get());
      //     }
      //     objects.push({
      //       ids: ids,
      //       id: notes[i].id
      //     });
      //   }
      //   this.viewer.restoreAllMaterialColor(objects);
      // }

    }
  ]);