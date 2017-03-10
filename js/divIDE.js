
// Define the main API
var divIDE = {
  nPanels: 0,
  // Support for right-click context menus
  ctxTarget: undefined,

  getCtxTarget: function (elem) {
    var ctx_target = elem;
    var panelType = $(elem).attr('panelType');
    if (panelType == undefined){
      elem = elem.closest('[paneltype]');
    }
    return elem
  },

  showMenu: function (event){
    divIDE.clearMenu();
    divIDE.ctxTarget = divIDE.getCtxTarget($(event.target));
    var panelType = divIDE.ctxTarget.attr('panelType');
    var panelMenu = divIDE.panelTypes[panelType].showMenu;
    if (panelMenu == undefined){
      divIDE.showMenuType(panelType);
    } else {
      divIDE.panelTypes[panelType].showMenu(panelType, event);
    }
  },

  showMenuType: function(panelType){
      var ctxMenu = $("#" + panelType + "CtxMenu")[0];
      if (ctxMenu == undefined){
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      ctxMenu.style.display = "block";
      ctxMenu.style.left = (event.pageX - 10)+"px";
      ctxMenu.style.top = (event.pageY - 60)+"px";
  },

  clearMenu: function (elem){
//     divIDE.ctxTarget = undefined;
    var ctxMenus = $(".ctxMenu");
    for (var i=0; i < ctxMenus.length; i++){
        ctxMenus[i].style.display = "none";
        ctxMenus[i].style.left = "";
        ctxMenus[i].style.top = "";    
    }
  },

  // Container for storing registered panels
  panelTypes: {
  },

  panelDataLinks: {  // Container for storing data links between panels
  },

  panelDataChangeId: {

  },
  
  // Support for registering a new panel
  registerPanel: function (panel) {
    divIDE.panelTypes[panel.name] = panel;
    var topMenus = panel.topMenuItems;
    if (topMenus != undefined){
      divIDE.addTopMenuItems(panel);
    }
    var ctxMenus = panel.contextMenuItems;
    if (ctxMenus != undefined){
      divIDE.addContextMenuItems(panel);
    }
    var ready = panel.ready;
    if (ready != undefined){
      panel.ready();
    }
    layout.populatePanelTypeSelectorOptions();
  },
  // Functions related to adding top and context menus
  // helper function for recursion
  _addSubMenus: function (menus, idprepend){
    if (idprepend == undefined){
      var idprepend = '';
    }
    var html = '';
    for (key in menus){
      var attrs = '';
      for (attrkey in menus[key]){
        if (attrkey == 'subMenus'){
          continue
        }
        attrs += " " + attrkey + '="' + menus[key][attrkey] + '" ';
      }
      
      var litext = '<li>';
      var ultext = '<ul class="menu">';

      html += litext + '\
        <a' + attrs + '>' + key + '</a>';
      if (menus[key].subMenus != undefined){
        html += ultext;

        html += divIDE._addSubMenus(menus[key].subMenus);
        html += '\
          </ul>'
      }
      html += '\
        </li>';
    }
    return html;
  },

  addTopMenuItems: function(panel){
    var parent = $('#topMenu').children();
    var html = '';

    // Add up them htmls
    html += divIDE._addSubMenus(panel.topMenuItems, 'topMenu');  
    parent.append(html);
  },

  addContextMenuItems: function (panel) {
    var parent = $('#CtxMenus')
    var html = '\
      <div id="' + panel.name + 'CtxMenu" class="ctxMenu" style="display:none" panelType="' + panel.name + '">\
        <ul class="dropdown menu vertical" data-dropdown-menu>'

    // Add up them menus
    html += divIDE._addSubMenus(panel.contextMenuItems);

    // Add closing div and ul text to go with context menus
    html += '\
        </ul> \
      </div>'
    parent.append(html);
  },

  // Data Links functions, uses panelDataLinks
  onLinkDataChange: function(elem, key){
    var parentElem = $(divIDE.getCtxTarget(elem));
    var panelType = parentElem.attr('panelType');
    var id = parentElem.attr('id');
    if (divIDE.panelDataChangeId == id){
      return;
    }
    if (divIDE.panelDataLinks[id] == undefined){
      return;
    }

    divIDE.panelDataChangeId = id;

    var data = divIDE.panelTypes[panelType].getPanelData(parentElem, key);
    
    var links = divIDE.panelDataLinks[id];
    for (link in links) {
      var linkElem = $('#'+link);
      var linkPanelType = linkElem.attr('panelType');

      divIDE.panelTypes[linkPanelType].setPanelData(linkElem, data, links[link]);
    }

    divIDE.panelDataChangeId = undefined;
  },


  // Saving and Loading functions
  // TODO: This needs work for exporting, maybe should go in the definition of a layout panel
  containerContents: function (elem){
    var contents = [];
    var children = $(elem).children('div');
    for (var i = 0; i < children.length; i++){
      var child = $(children[i]);
      contents.push({
         divType: $(elem).attr('panelType'),
         classes: child.attr('class'),
         id: child.attr('id'),
         style: child.attr('style'),
         data: {
             contents: divIDE.containerContents(child),
             width: child.css('max-width'),
             height: child.css('max-height'),
             flex: child.css('flex')
         }
      });
    }
    return contents;
  },

  // Setting up the common functions, general utility
  // Downloading a file: http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
  download: function(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  },

  // Looks like importing is trickier: https://www.html5rocks.com/en/tutorials/file/dndfiles/
  // Importing/reading a single file: http://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
  upload: function(e, callback) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        callback(reader.result);
    }
    // This function is asynchronous, which means we have no idea when it will happen. 
    // As such, after it's finished, we need to have a callback to do something with the
    // results. Hence the above callback function.
    reader.readAsText(file);
  }  
}


// Main panel definition
var main = {
  name: "mainDivIDE", 
  contextMenuItems: {
    "Add Panel": {
      id: 'mainAddPanel',
      onclick: 'layout.addPanel()',
    },
    "Align": {
      id: 'mainAlign',
      subMenus: {
        "Vertical": {
          id: "mainAlignVertical",
          onclick: 'layout.alignVertical()'
        },
        "Horizontal": {
          id: "mainAlignHorizontal",
          onclick: 'layout.alignHorizontal()'
        }
      }
    }
  },
  topMenuItems: {
    File: {
      subMenus: {
        Open: {
          id: 'tmFileOpen'
        },
        Recent: {
          id: 'tmFileRecent',
          subMenus: {
            item1: {
              id: 'item1'
            },
            item2: {
              id: 'item2'
            }
          }
        }
      },
      id: "tmFile"
    }
  },
  showMenu: function(panelType, event) {
    if ($('#tmLayoutEdit').data('clicks')){
      divIDE.showMenuType(panelType);
    }
  },

  ready: function () {
    var mainDivIDE = $("#mainDivIDE")[0];
    mainDivIDE.addEventListener("contextmenu", divIDE.showMenu, false);
    mainDivIDE.addEventListener("click", divIDE.clearMenu, false);
    $(mainDivIDE).addClass('borderStyle rowItems divIDELayout');
    $(mainDivIDE).attr('panelType', 'mainDivIDE')
    $(mainDivIDE).append("\
        <a href='#' class='layoutToolBarButton button' onclick='layout.alignToggle(this)'\
          style='margin-left: 0px; display:none;'>--</a>\
        <a href='#' class='layoutToolBarButton button' onclick='layout.addPanelButton(this)'\
          style='margin-left: 20px; display:none;'>+</a>\
          ");

  }
}

// Layout panel definition
layout = {
  name: "DivIDELayout", 
  panelHTML: function(elId) {
    // Tried a button, didn't work <button class='button layoutToolBar' type='button' data-toggle='layout-toolbar'>+</button>
    //                               <div class='layoutToolBar dropdown-pane' id='layout-toolbar' data-dropdown> 
    var html = "\
      <div> \
        <a href='#' class='layoutToolBarButton button hollow secondary'\
          style='margin-top: 20px;'>" + elId.split('-')[1] + "</a>\
        <button class='layoutToolBarButton button' type='button' data-toggle='" + elId + "sizeDrop'>.</button>\
        <a href='#' class='layoutToolBarButton button' onclick='layout.alignToggle(this)'\
          style='margin-left: 20px;'>--</a>\
        <a href='#' class='layoutToolBarButton button' onclick='layout.addPanelButton(this)'\
          style='margin-left: 40px;'>+</a>\
        <a href='#' class='layoutToolBarButton button' onclick='layout.removePanelButton(this)'\
          style='margin-left: 60px;'>D</a>\
        <button class='layoutToolBarButton button' type='button' style='margin-left: 80px;'\
          data-toggle='" + elId + "linkDrop'>8</button>\
        <table class='layoutToolBar dropdown-pane' id='" + elId + "sizeDrop' data-dropdown><tbody> \
        <tr>\
          <td>Width:</td> \
          <td><input type='number' min=0 max=2048 class='layoutWidth' value='1' onchange='layout.boxWidthChange(this)'> \
          </input> </td> \
          <td> <select class='unit' onchange='layout.boxWidthChange(this)'> \
                <option value='flex'>flex</option> \
                <option value='px'>px</option> \
               </select> \
          </td> \
        </tr> \
        <tr>\
          <td>Height:</td> \
          <td><input type='number' min=0 max=2048 class='layoutWidth' value='1' onchange='layout.boxHeightChange(this)'> \
          </input> </td> \
          <td> <select class='unit' onchange='layout.boxHeightChange(this)'> \
                <option value='flex'>flex</option> \
                <option value='px'>px</option> \
               </select> \
          </td> \
        </tr> \
        <tr> \
          <td><select class='panelTypeSelector' onchange='layout.setPanelType(this)'>\
            <option value='DivIDELayout'> --- </option>\
            " + layout.panelTypeSelectorOptions + "\
            </select> \
          </td> \
        </tr> \
      </tbody></table>\
      <table class='layoutToolBar dropdown-pane layoutLinkSetup' id='" + elId + "linkDrop' data-dropdown><tbody> \
      <tr><td>HEY This needs some thought</td></tr>\
      </tbody></table>\
      </div>";
    return html
  }, 

  contextMenuItems: {
    "Add Panel": {
      id: 'mainAddPanel',
      onclick: 'layout.addPanel()',
    },
    "Remove Panel": {
      id: 'mainRemovePanel',
      onclick: 'layout.removePanel()',
    },
    "Align": {
      id: 'mainAlign',
      subMenus: {
        "Vertical": {
          id: "mainAlignVertical",
          onclick: 'layout.alignVertical()'
        },
        "Horizontal": {
          id: "mainAlignHorizontal",
          onclick: 'layout.alignHorizontal()'
        }
      }
    }
  },

  topMenuItems : {
    Layout: {
      subMenus: {
        Edit: {
          id: 'tmLayoutEdit',
          onclick: 'layout.layoutEdit(this)'
        },
        Save: {
          id: 'tmLayoutSave',
          onclick: 'layout.exportLayout()'
        },
        Load: {
          id: 'tmLayoutLoad',
          onclick: "$('#tmLayoutLoadFile').click()",
        }
      },
      id: "tmLayout"
    }
  },

  showMenu: function(panelType, event) {
    if ($('#tmLayoutEdit').data('clicks')){
      divIDE.showMenuType(panelType);
    }
  },

  getPanelData: function(elem) {
    var trs = $(elem).find('tr');
    var data = {};
    for (var i=0; i < trs.length; i++){
      var val = $(trs[i]).find('input').val();
      var unit = $(trs[i]).find('select').val();
      var key = '';
      if ($(trs[i]).text().toLowerCase().includes('width')){
        key = 'width';
      } else if ($(trs[i]).text().toLowerCase().includes('height')) {
        key = 'heigth';
      }
      data[key] = {size: val, unit: unit};

    }
    return data;
  },


  // Other functions related to this panel specifically, not part of the divIDE interface...
  panelTypeSelectorOptions: '', // The registered panel types will go here

  populatePanelTypeSelectorOptions: function (){
    for (key in divIDE.panelTypes) {
      if (key == main.name || key == layout.name){
        continue;
      }
      layout.panelTypeSelectorOptions += " \
           <option value='" +  key + "'> " + key + " </option>";
    }
  },

  layoutEdit: function(elem) {
    var clicks = $(elem).data('clicks');
    if (clicks) {
      $('.' + this.name).addClass("borderStyle");
      $('#mainDivIDE').addClass("borderStyle");
      $('.' + this.name).removeClass("editBorderStyle");
      $('#mainDivIDE').removeClass("editBorderStyle");
      $(elem).text('Edit'); 
      $('.layoutToolBar').hide();
      $('.layoutToolBarButton').hide();
      $('.divIDEPanel').css('display', 'flex');
    } else {
      $('.' + this.name).removeClass("borderStyle");
      $('#mainDivIDE').removeClass("borderStyle");
      $('.' + this.name).addClass("editBorderStyle");
      $('#mainDivIDE').addClass("editBorderStyle");
      $(elem).html(' &#8594; Edit');
      $('.layoutToolBar').show();
      $('.layoutToolBarButton').show();
      $('.divIDEPanel').hide();
    }
    $(elem).data("clicks", !clicks);
  },

  boxSizeChange: function (melem, wh){
      var elem = $(melem).closest('div');
      var tr = $(melem).closest('tr');
      var unit = $(tr).find('select')[0].value;
      var size = $(tr).find('input')[0].value;
      if (unit == 'flex'){
          elem.css('flex', size);
          elem.css('max-' + wh, '');
          inputs = elem.find('input');
          for (var i = 0; i < inputs.length; i++){
              var u = $(inputs[i]).closest('tr').find('select')[0].value;
              if (u == 'flex'){
                  inputs[i].value = size;
              }
          }
      } else if (unit == 'px') {
          elem.css('flex', '');
          elem.css('max-'+ wh, size + unit);
      }
  },

  boxWidthChange: function (melem){
      this.boxSizeChange(melem, 'width');
  },
  boxHeightChange: function (melem){
      this.boxSizeChange(melem, 'height');
  },

  removePanelButton: function(elem) {
    divIDE.ctxTarget = divIDE.getCtxTarget(elem);
    this.removePanel();        
  },

  removePanel: function (){
      parentElem = divIDE.ctxTarget;
      if (parentElem.id != 'main'){
          parentElem.remove();
      }
  },

  addPanelButton: function (elem) {
    divIDE.ctxTarget = divIDE.getCtxTarget(elem);
    this.addPanel();    
  },

  addPanel: function (){
    parentElem = $(divIDE.ctxTarget);
    var classes = this.name + ' rowItems';
    if ($('#tmLayoutEdit').data('clicks')){
      classes += ' editBorderStyle'
    } else {
      classes += ' BorderStyle';
    }

//     var elId = $(parentElem).attr('id') + '-' + $(parentElem).children().length;
    var elId = "divIDEPanelNumber-" + divIDE.nPanels;
    divIDE.nPanels += 1;
    
    // Grab the template layout element
    var template = this.panelHTML(elId);

    parentElem.append(template);

    var div = parentElem.children()[parentElem.children().length - 1];
    $(div).attr('id', elId);
    $(div).attr('panelType', this.name);
    $(div).addClass(classes);
    $(div).foundation();
  },

  setPanelType: function(elem){
    var parentElem = $(divIDE.getCtxTarget(elem));
    var panelType = $(elem).val();
    var panelDiv = parentElem.find('[panelType]');
    if (panelType == layout.name) {
      // remove any existing divs
      panelDiv.remove();
      return;
    } else if (panelType == panelDiv.attr('panelType')) {
      return;
    }
    var div = document.createElement('div');
    var panel = divIDE.panelTypes[panelType];
    $(div).attr('panelType', panelType);
    $(div).attr('id', parentElem.attr('id') + '-container')
    $(div).addClass('divIDEPanel');
    $(div).addClass(panel.name);
    $(div).html(panel.panelHTML(parentElem.attr('id')));
    parentElem.append(div);
  },

  alignToggle: function(elem){
    divIDE.ctxTarget = $(divIDE.getCtxTarget(elem));
    if (divIDE.ctxTarget.hasClass('rowItems')){
      layout.alignVertical();
      $(elem).text('|');
    } else {
      layout.alignHorizontal();
      $(elem).text('--');
    }

  },

  alignVertical: function (melem){
      elem = divIDE.ctxTarget;
      elem.removeClass("rowItems")
      elem.addClass("columnItems")
  },

  alignHorizontal: function (melem){
      elem = divIDE.ctxTarget;
      elem.removeClass("columnItems")
      elem.addClass("rowItems")
  },

  // Loading and Saving
  exportLayout: function(){
    // Build the json structure defining the layout
    var main = $('#mainDivIDE');
    var layout = {
        divMain: {
            divType: this.name, //has to be a layout panel
            classes: main.attr('class'),
            id: main.attr('id'),
            panelType: main.attr('panelType'),
            data: {
                contents: divIDE.containerContents(main)
            }
        }
    }
    divIDE.download('layout.json', JSON.stringify(layout));
  },

  loadLayout: function(e){
      var layoutObj;
      function callback(result) {
          layoutObj = JSON.parse(result);

          importLayout(layoutObj);
      }
      divIDE.upload(e, callback);
  },

  importLayout: function(layoutObj){
      // TODO: FINISH THIS
      console.log(layoutObj);
  },

  // Ready function

  ready: function(){
    $('#tmLayoutLoad').parent().append('<input type="file" id="tmLayoutLoadFile" style="display: none;" "/>');
    $('#tmLayoutLoadFile').change(function (e) {
      var layoutObj;
      function callback(result) {
        layoutObj = JSON.parse(result);
        layout.importLayout(layoutObj);
      }
      divIDE.upload(e, callback);
    });
    layout.populatePanelTypeSelectorOptions();
  }
}

// Initialization
// Setting up the main structure

// Panels need to be registered BEFORE foundation is imported
divIDE.registerPanel(main);  
divIDE.registerPanel(layout);  





