// function ChatPanel(viewer, options) {
//     Autodesk.Viewing.Extension.call(this,viewer,options);
//     curr_viewer = viewer;
//     viewer.registerContextMenuCallback('rightClickMenu',this.RightClick);
//     this.panel = null;
// }


// // ChatPanel.prototype.load = function(){
// //     if(this.viewer.toolbar) {
// //         this.createUI();
// //     } else {
// //         this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
// //         this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
// //     }

// //     return true;
// // }

// PanelExtension.prototype.RightClick = function(menu,status) {

//     if(status.hasSelected) {
//         menu.push({
//             title: 'See Chat',
//             target: function(){
//                 console.log(yes)
//             }
//         })
//     }
// }

// PanelExtension.prototype.CreatePanel = function(title){
//     if(this.viewer.toolbar) {
//         this.createUI();
//     } else {
//         this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
//         this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
//     }

//     return true;
// }

// PanelExtension.prototype.createUI = function(){

//     var viewer = this.viewer;
//     var title = ''
//     this.panel = new PanelClass(viewer,title);

// }