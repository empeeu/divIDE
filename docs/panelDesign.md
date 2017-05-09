# Panel Design

To make a new panel available in the divIDE layout editor, it needs to be registered. To register a new panel type (i.e. `examplePanel`), you need to call:

```javascript
divIDE.addPanel(examplePanel)
```

`examplePanel` is an object that contains a mixture of functions and 
attributes describing the new panel. The schema is as follows:

```javascript
examplePanel = {
    name: 'examplePanel',  // This should also be the class name

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

    setPanelData: function(parentElement, data, key) {}, // Set panel data of `parentElement` with `key` equal to `data`
                                                        // This function is called by divIDE.onLinkDataChange function

    getPanelData: function(panelElement, key){},  // returns the panel data with this `key`

    ready: function(){}, // Any required initialization not handled by divIDE called after panel registration
    
    init: function(uniquePanelId){}  // Any required initialization after a panel of this type is actually created
}
```

Any newly created panels may define how data is retrieved and set. Data can either be stored in html elements, or `divIDE.panelJSData` using an appropriate key value. `divIDE.panelJSData` is an object. It is recommended that the `uniqueID` of the panel is used as the key in `divIDE.panelJSData`

For examples, see the `www/panels` directory.