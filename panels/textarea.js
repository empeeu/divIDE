textArea = {
    name: "TextArea", 
    panelHTML: function(uniqueParentElementID) {
        var html = '';
        html += "<textarea class='divIDETextArea'\
                     onchange=\"divIDE.onLinkDataChange(this, 'text')\">\
                 </textarea>"
        return html;
    }, 
/*    panelContextMenu: function(parentElement) {
        // TODO implement     
    },
    topMenuItems : {
        
    },*/

    getPanelData: function(parentElement, key){
      if (key == 'text'){
         var ta = $(parentElement).find('textarea');
         return ta.text();  
      } else { 
         return;
      }
    },

    setPanelData: function(parentElement, data, key) {
      if (key == 'text'){
         var ta = $(parentElement).find('textarea');
         ta.text(data);  
      }
    }
}

divIDE.registerPanel(textArea);