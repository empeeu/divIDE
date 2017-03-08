textArea = {
    name: "TextArea", 
    panelHTML: function(uniqueParentElementID) {
        var html = '';
        html += "<textarea class='divIDETextArea'></textarea>"
        return html;
    }, 
/*    panelContextMenu: function(parentElement) {
        // TODO implement     
    },
    topMenuItems : {
        
    },*/
    data: {
        callbackFunctions: [],
        dataLinks: {
        },
    },
    getPanelData: function(panelElement){
      var ta = $(panelElement).find('textarea');
      return ta.text();  
    },
    onDataLinksChanges: function(element){
        // TODO implement
    }
}

divIDE.registerPanel(textArea);