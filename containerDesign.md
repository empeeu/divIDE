To register a new panel type, you need to call:

    `divIDE.addPanel(panelData)`

`panelData` is an object that contains a mixture of functions and 
attributes describing the new panel. The schema is as follows:

panelData = {
	panelHTML: function (parentElement),
        panelContextMenu: function(parentElement), 
        data: {},
        dataLinks: {},
        topMenuItems: {},
}

