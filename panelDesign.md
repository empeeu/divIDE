To register a new panel type, you need to call:

    `divIDE.addPanel(panelName)`

`panelName` is an object that contains a mixture of functions and 
attributes describing the new panel. The schema is as follows:

panelName = {
        name: 'panelName',  // This should also be the class name

	panelHTML: function (uniqueParentElementID),

        panelContextMenu: function(parentElement), 

        contextMenuItems: {
            menuName: {
            attr1: 'Value of attribute',
            attr2: 'Value of attribute',
            subMenus: {
                // Same structure as contextMenuItems
            }
          }
        },
        topMenuItems: {
          menuName: {
            attr1: 'Value of attribute',
            attr2: 'Value of attribute',
            subMenus: {
                // Same structure as topMenuItems
            }
          } 
        },

        onDataLinkChange: {},  // When linked data changes, do this update
                               // This function goes into the 
                               // data.callbackFunctions of the linked panel

        getPanelData: function(panelElement)  // returns the panel data in an
                                              // object

        ready: function(), // Any required initialization not handled by divIDE
        
}

// When a new panel of this particular type is created, this object is 
// created and referenced by the divID.
panelData = {
    panelID: 
        data: {
            callbackFunctions: [],  // empty to start with. These functions
                                    // are called when data in this panel 
                                    // changes
            dataLinks: {},  // links to data from other panels
        }        
}        
