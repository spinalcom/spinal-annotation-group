

class MessagePanel {
    constructor(viewer,notes,user) {
        this.detailPanel = null;
        this.detailPanelContent = null;
        this.model = notes;
        this.viewer = viewer;
        this._selected = null;
        this.user = user;
    }

    DetailPanel(themeId,annotationId) {
        var notes = this.model;


        if(this.detailPanelContent == null){
            this.detailPanelContent = document.createElement('div');
            this.detailPanelContent.className = "content";
        }

        if(this.detailPanel == null) {
            this.detailPanel = new PanelClass(this.viewer,annotationId);
            this.detailPanel.initializeMoveHandlers(this.detailPanel.container);
            this.detailPanel.container.appendChild(this.detailPanel.createCloseButton());
            this.detailPanel.container.style.right = "0px";
            this.detailPanel.container.style.width = "400px";
            this.detailPanel.container.style.height = "600px";
            this.detailPanel.container.padding = "0px";

        }

        for (let index = 0; index < notes.length; index++) {
            if(notes[index].id == themeId){
                for (let i = 0; i < notes[index].listModel.length; i++) {
                    if(notes[index].listModel[i].id == annotationId) {
                        this._selected = notes[index].listModel[i];
                        break;
                    }
                    
                }
                break;   
            }   
        }

        var formDiv = document.createElement('div');
        formDiv.className = "form_div";


        var textareaDiv = document.createElement('div');
        textareaDiv.className = "textarea_div";

        var inputText = document.createElement('textarea');
        inputText.className = "form-control";
        inputText.setAttribute('rows','2')
        inputText.id = this._selected.id.get();
        inputText.placeholder = "add texte";

        inputText.onclick = () => {
            inputText.focus();
        }

        textareaDiv.appendChild(inputText);

        var sendButtonDiv = document.createElement('div');
        sendButtonDiv.className = "send_button_div"

        var sendButton = document.createElement('button');
        sendButton.className = "btn btn-block";
        sendButton.textContent = "Add";
        sendButton.id = this._selected.id.get();;

        sendButton.onclick = () => {
            var textAreaValue = document.querySelector(`textarea[id='${sendButton.id}']`).value;
            document.querySelector(`textarea[id='${sendButton.id}']`).value = "";

            if(textAreaValue != "" && textAreaValue.trim() != "") {
                var message = new MessageModel();
                message.id.set(newGUID());
                message.owner.set(this.user.id);
                message.username.set(this.user.username);
                message.date.set(Date.now());
                message.message.set(textAreaValue);

                this._selected.notes.push(message);
            }

        }

        sendButtonDiv.appendChild(sendButton);
        
        formDiv.appendChild(textareaDiv);
        formDiv.appendChild(sendButtonDiv);
        
        this.detailPanel.setVisible(true);
        
        notes.bind( () => {   
            this.DisplayMessage(formDiv)
        });


    }

    DisplayMessage(formDiv) {
        var _self = this;
        var messageContainer = document.createElement('div');
        messageContainer.className = "messageContainer"; 

        for (let i = 0; i < this._selected.notes.length; i++) {
            //message div
            var message_div = document.createElement('div');
            message_div.className = "message_div";

            //header message
            var _message = document.createElement('div');
            _message.className = "_message";
            
            //name
            var message_owner = document.createElement('div');
            message_owner.className = "message_owner";
            message_owner.innerText = this._selected.notes[i].username.get();


            //date
            var message_date = document.createElement('div');
            message_date.className = "message_date";
            var date = new Date(parseInt(this._selected.notes[i].date));
            message_date.innerText =   date.getDate() + "/" + date.getMonth() + 1 + "/" + date.getFullYear();

            

            //message content
            var message_content = document.createElement('div');
            message_content.className = "message_content";

            var message_texte = document.createElement('div');
            message_texte.className = "message_texte";
            message_texte.innerHTML = this._selected.notes[i].message;

            if(this._selected.notes[i].owner == this.user.id) {
                var closeDiv = document.createElement('div');
                closeDiv.className = "close_div";

                var span = document.createElement('span');
                span.innerHTML = "X";
                span.className = "close";
                span.id = this._selected.notes[i].id

                span.onclick = function(){
                var dialog = $mdDialog.confirm()
                    .ok("Delete !")
                    .title('Do you want to remove it?')
                    .cancel('Cancel')
                    .clickOutsideToClose(true);
            
                    $mdDialog.show(dialog)
                    .then((result) => {
                    _self.deteteMessage(this.id,formDiv);
                    }, function(){});
                
                }

                closeDiv.appendChild(span);
                message_content.appendChild(closeDiv);
            }

            message_content.appendChild(message_texte);

            _message.appendChild(message_owner);
            _message.appendChild(message_content);
            


            message_div.appendChild(message_date);
            message_div.appendChild(_message);
            

            messageContainer.appendChild(message_div);

        }


        this.detailPanelContent.innerHTML = "";

        this.detailPanelContent.appendChild(messageContainer);
        this.detailPanelContent.appendChild(formDiv);

        this.detailPanel.setTitle(this._selected.title.get());
        this.detailPanel.container.appendChild(this.detailPanelContent);

        var d = document.getElementsByClassName("messageContainer")[0];
        d.scrollTop = d.scrollHeight;

    }

    deteteMessage(id, formDiv) {
    
        for (let i = 0; i < this._selected.notes.length; i++) {
            
            if(this._selected.notes[i].id == id) {
            this._selected.notes.splice(i,1);
            // this.DisplayMessage(formDiv);
            break;
            }
            
        }

    }
}