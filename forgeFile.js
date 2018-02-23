// Copyright 2015 SpinalCom  www.spinalcom.com

// This file is part of SpinalCore.

// SpinalCore is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Soda is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with Soda. If not, see <http://www.gnu.org/licenses/>.
var issim = require('spinal-lib-issim');
var TreeItem = issim.TreeItem;
var exports = module.exports = {};


var ForgeFileDerivativesItem = class ForgeFileDerivativesItem extends TreeItem {
  constructor(params) {
    var i, item, k, len, name, ref, res, v;
    super();
    if (params != null && params.outputType) {
      name = params.outputType;
    } else if (params != null && params.name) {
      name = params.name;
    } else if (params != null && params.role) {
      name = params.role;
    } else {
      name = "no name";
    }
    this.add_attr({
      name: name
    });
    this._name.set(this.name);
    if (!params) {
      return;
    }
    res = {};
    for (k in params) {
      v = params[k];
      if (params.hasOwnProperty(k)) {
        if (k === "name") {
          continue;
        } else if (k === "children") {
          ref = params[k];
          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            this.add_child(new ForgeFileDerivativesItem(item));
          }
        } else {
          res[k] = params[k];
        }
      }
    }
    this.add_attr(res);
  }

  display_suppl_context_actions(context_action) {}

  accept_child(ch) {
    return ch instanceof ForgeFileDerivativesItem;
  }

};
exports.ForgeFileDerivativesItem = ForgeFileDerivativesItem;

var ForgeFileItem = class ForgeFileItem extends TreeItem {
  constructor(name = "Forge File") {
    super();
    this._name.set(name);
    this._viewable.set(false);


    let tmp = {
      name: this._name,
      filepath: new Path(),
      state: new Choice(0, ["Initial",
        "Uploading", "Uploading completed",
        "Uploading to forge", "Upload to forge completed",
        "Translating", "Translating completed",
        "Export completed", "Failed"
      ]),
      urn: "",
      ask_token: false,
      oauth: "",
      bucket_key: ""
    };
    this.add_attr(tmp);
  }

  accept_child(ch) {
    return (ch instanceof ForgeFileDerivativesItem);
  }
};

exports.ForgeFileItem = ForgeFileItem;


var ThemeModel = class ThemeModel extends Model {
  constructor(){
    super()
    this.add_attr({
      id : "",
      name : "",
      owner : "",
      username : "",
      creation : "",
      listModel : []
    })
  }


}

exports.ThemeModel = ThemeModel;


var NoteModel = class NoteModel extends Model {
  constructor(name = "Forge File") {
    super();

    this.add_attr({
      id: '',
      title: '',
      color: '',
      owner: '',
      username : '',
      date: '',
      allObject: [],
      notes : [],
      view : false,
      files : new Directory()
    });
  }
}

exports.NoteModel = NoteModel;

var MessageModel = class MessageModel extends Model {
  constructor() {
    super();
     this.add_attr({
      id : '',
      username : '',
      owner : '',
      message : '',
      date : ''
    });
  }
}

exports.MessageModel = MessageModel;


var FileModel = class FileModel extends Model {
  constructor(file) {
    super();
    this.add_attr({
      id : '',
      username : '',
      owner : '',
      name : '',
      date : '',
      path : new Path()
    })
  }
}
exports.FileModel = FileModel;
