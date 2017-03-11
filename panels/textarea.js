textArea = {
    name: "TextArea", 
    panelHTML: function(uniqueParentElementID) {
        var html = '';
        html += "<textarea class='divIDETextArea'\
                 oninput=\"divIDE.onLinkDataChange(this, 'text')\"></textarea>"
        return html;
    }, 
/*    panelContextMenu: function(parentElement) {
        // TODO implement     
    },
    topMenuItems : {
        
    },*/

    linkDataKeys: [
        'text'
    ],

    getPanelData: function(parentElement, key){
      if (key == 'text'){
         var ta = $(parentElement).find('textarea');
         return ta.val();  
      } else { 
         return;
      }
    },

    setPanelData: function(parentElement, data, key) {
      if (key == 'text'){
         var ta = $(parentElement).find('textarea');
         ta.val(data);  
      }
    }
}

divIDE.registerPanel(textArea);
