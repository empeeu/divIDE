# Introduction

The main API for panel developers lives inside the divIDE object or namespace. 
This document describes the functions and datastructures that can be used as part of a custom panel. 

For the format of new panel, see [panelDesign](panelDesign.md).~~~~

# Function and Attribute Documentation

---

***nPanels***: *int*

  * The number of panels that had been created. This number only increments. In the process of editing a layout, if a user deletes a panel, this number does not change. Whenever a panel is added, this number increases by one. 
 
> __Notes__: The reason why the number never decreases is because the logic for re-numbering panels is error-prone. For example, create panels 1, 2, 3, 4, then delete panel 2. Now add a new panel. The current scheme has that panel number 5. This allows all datalinks to be maintained. 

---

***ctxTarget***: *Element*

  * The context-menu target element. When right-clicking on a panel, the right-clicked panel element will be this target. 

---
    
*Element* = **getCtxTarget**(elem)

  * The purpose of this function is to find the parent layout panel of `elem`, where `elem` can be the parent of one of its children. This is used to find the correct panelType key to invoke the correct right-click menu item. 

__Parameters__

  * ***elem***: *Element* 
    * The child element of a layout panel    
        
__Returns__

  * ***elem***: *Element*
    * The closest parent element with a `panelType` attribute.
        
---

**showMenu**(event)

  * The purpose of this function is to either select the divIDE right-click menu function, or a panel-custom right-click function, and give this function the correct html element.

__Parameters__

  *  ***event***: MouseEvent
    * A right-click mouse event caused by `contextmenu` being fired from the `mainDivIDE` div using an event listener
  
> __Notes__: This function will set divIDE.ctxTarget = divIDE.getCtxTarget(event.target)

**showMenuType**(panelType)

* The purpose of this function is to display the right-click menu of a particular panel type and prevent the usual right-click behaviour. 

___
**clearMenu**(elem)

  * The purpose of this function is to clear out the right-click menu after the user has either clicked on or off the menu
  
---

***panelTypes***: *Object*

  * An object for easy access and storage of panelTypes
  
---  
  
***panelDataLinks***: *Object*
   
  * An object for storing the data links that are set up between objects
  
---

***panelJSData***: *Object*
  
  * Container for storing javascript data objects for panels. A panel may use this structure to store any runtime variables, settings, etc. and these persist when layouts are exported.
    
---

***panelDataChangeId***: String
  * This is used to store the ID of a panel that started an onDataChange event, and is used to avoid circular dependencies and infinite loops
  
---

***panelDataChnageKey***: *Object*
  
  * This is used to store the ID of a panel that started an onDataChange event, and is used to avoid circular dependencies and infinite loops
  
---

**registerPanel**(panel)

  * The purpose of this function is to register a new panel that may have been created as a divIDE Plugin. This function:
    
    1. Adds this panel to ***panelTypes***
    2. Creates the panel's top menu items
    3. Creates the panel's right-click context menu
    4. Calls the panel's **ready** function

  __Parameters__
  
  * ***panel***: *Object*
     * Definition of a divIDE panel is contained in this structure. This structure is defined in detail in the `panelDesign.md` document
     
---

String = **_addSubMenus**(menu)

  * The purpose of this function is to implement common functionality for adding context- and top-menu items. 

__Parameters__

  * ***menu***: *Object*
    * Object that describes the menu. The structure of this object is defined in detail in the `panelDesign.md` document.
    
__Returns__

  * ***html***: *String*
    * The `html` markup that describes this part of the menu
    
---

String = **addTopMenuItems**(menu)

  * The purpose of this function is to add top menu items as defined in panels. This function adds these elements to the document.

__Parameters__

  * ***panel***: *Object*
    * Object describing the panel. The structure of this object is defined in detail in the `panelDesign.md` document.

---
    
String = **addContextMenuItems**(menu)

  * The purpose of this function is to add top menu items as defined in panels. This function adds these elements to the document.

__Parameters__

  * ***panel***: *Object*
    * Object describing the panel. The structure of this object is defined in detail in the `panelDesign.md` document.
    
    
---
**onLinkDataChange**(elem, key)
  
  * The purpose of this function is to set panel data for linked destination panels when a source panel data changed.
  * Developers should feel free to call this function directly from their javascript, or hook this into the onchange functions of their html elements.
  
__Parameters__

  * ***elem***: *Element*
    * The `html` element that triggered the change. Usually `this` is used (see example below)
    
  * ***key***: *String*
    * The name of the data that changed in the source panel. This should match an entry in the source panel's **linkDataKeys** list attribute. 

> __Examples__
> In the textarea panel, this function is used as follows: `<textarea ... oninput=divIDE.onLinkDataChange(this, 'text')></textarea>`. This causes any user-typed data to be sent from this panel to any linked panels through `onDataLinkChange`

---

**addDataLink**(elem)

  * The purpose of this function is to add a data link between panels.  This function populates the ***divIDE.panelDataLinks*** object.
  * This function should not normally be called directly by panel developers.
  
__Parameters__

  * ***elem***: *Element*
    * The `html` element that specified the data link. This usually resides in a layout panel.
    
---

**removeDataLink**(elem)

  * The purpose of this function is to remove an existing data link between panels.  This function modifies the ***divIDE.panelDataLinks*** object.
  * This function should not normally be called directly by panel developers.
  
__Parameters__

  * ***elem***: *Element*
    * The `html` element that triggered the data link removal. This usually resides in a layout panel.
    
---

contents = **getPanelContents**(elem)

  * The purpose of this function is to store the contents of a panel in a json object. 
  * This stores:
    * The HTML attributes of the panel, including the `panelType`, any `class` specifications, the `id`, and ~~any `style` specifications~~. 
    * The data of the panel. I.e. the value of every ***panel.linkDataKeys***
    * All child panels (in the same format)
  
__Parameters__

  * ***elem***: *Element*
    * The panel's parent `html` element.
    
__Returns__

  * **contents**: *Object*
    * The contents of a panel described in a `json` object.

---

**setPanelContents**(layoutObj)

  * The purpose of this function is to restore the contents of a panel given a json object. 
  * This function reverses **getPanelContents**
  * This function requires that an `html` element with `id`=**layoutObj.attrs['id']** exists
  * This function will recursively populate any child elements as well, creating any child `html` elements
  
__Parameters__

  * **contents**: *Object*
    * The contents of a panel described in a `json` object.

---

**populateDataLinks**()

  * The purpose of this function is to restore the data link `html` elements in `layout` panels when importing a saved layout.
  * This function uses **divIDE.panelDataLinks** 
  * Restoring the `html` elements in the layout panel is necessary to allow users to delete existing data links between panels after importing a layout.

---

**download**(filename, text)

  * Generic function that allows users to download (or save) files from divIDE GUI's
  
__Parameters__

  * **filename**: *String*
    * The default name of the file that the user will save to disk
    
  * **text**: *String*
    * The Stringified data that will be saved to the downloaded files

---

**upload**(e, calllback)

  * Generic function that allows users to upload (or open) files to divIDE GUI's
  
__Parameters__

  * **e**: *Element*
    * The file `html` element used for uploading. 
    
  * **callback**: *function*
    * The callback function that will be executed once the file upload completes. 
    * Since file-uploading happens asynchronously, a callback is necessary to process the opened file. 

__Examples__
For example, to load layouts, divIDE uses the following `html`:
```html
<a id="tmLayoutLoad" onclick="$('#tmLayoutLoadFile').click()">Load</a>
<input type="file" id="tmLayoutLoadFile" style="display: none;"></li>
```
along with an event listener:
```javascript
$('#tmLayoutLoadFile').change(function (e) {
var layoutObj;
function callback(result) {
layoutObj = JSON.parse(result);
layout.importLayout(layoutObj);
}
divIDE.upload(e, callback);
});

```
---


---