
// Define the main API
var divIDE = {
  ctxTarget: undefined,

  showMenu: function (event){
    divIDE.clearMenu();
    divIDE.ctxTarget = $(event.target);
    var panelType = divIDE.ctxTarget.attr('panelType');
    if (panelType == undefined){
      divIDE.ctxTarget = divIDE.ctxTarget.closest('[paneltype]');
      panelType =  divIDE.ctxTarget.attr('panelType');
    }
    var panelMenu = divIDE.panelTypes[panelType].showMenu;
    if (panelMenu == undefined){
      divIDE.showMenuType(panelType);
    } else {
      divIDE.panelTypes[panelType].showMenu(panelType, event);
    }
  },

  showMenuType: function(panelType){
      event.stopPropagation();
      event.preventDefault();
      var ctxMenu = $("#" + panelType + "CtxMenu")[0];
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
  panelTypes: {  
    main: {
      showMenu: function(panelType, event) {
        if ($('#tmLayout').data('clicks')){
          divIDE.showMenuType(panelType);
        }
      }
    }
  },
  
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
    var panelHTML = panel.panelHTML;
    if (panelHTML != undefined){
      divIDE.addPanelExampleDiv(panel);
    }
    var ready = panel.ready;
    if (ready != undefined){
      panel.ready();
    }
  },
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

  addPanel: function (parentElem, panel){
    var elId = $(parentElem).attr('id') + '.' + panel.name + '.' + $(parentElem).children().length;
    var attrs = 'id="' + elId + '" panelType="' + panel.name;
    var html = panel.panelHTML(parentElem);
    parentElem.append(html);
  },

  addPanelExampleDiv: function (panel) {
    var parentElem = $('#examplePanels');
    var attrs = 'style="display:none;"';
    divIDE.addPanel(parentElem, panel, attrs);
  },

  containerContents: function (elem){
    var contents = [];
    var children = $(elem).children('div');
    for (var i = 0; i < children.length; i++){
      var child = $(children[i]);
      contents.push({
         divType: 'container',
         classes: child.attr('class'),
         id: child.attr('id'),
         style: child.attr('style'),
         data: {
             contents: containerContents(child),
             width: child.css('max-width'),
             height: child.css('max-height'),
             flex: child.css('flex')
         }
      });
    }
    return contents;
  },

  // Setting up the common functions, general utility
  exportLayout: function(){
      // Build the json structure defining the layout
      var main = $('#mainDivIDE');
      var layout = {
          divMain: {
              divType: 'container', //has to be a container
              classes: main.attr('class'),
              id: main.attr('id'),
              data: {
                  contents: divIDE.containerContents(main)
              }
          }
      }
      divIDE.download('layout.json', JSON.stringify(layout));
  },


  importLayout: function(layout){
      // TODO:
  },

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
  }
}

// Layout panel definition
layout = {
  name: "Layout", 
  panelHTML: function(parentElement, attrs) {
    var html = "\
      <div "  + attrs + "><table class='layoutBlock'><tbody> \
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
      </tbody></table></div>";
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
          id: 'tmLayoutSave'
        },
        Load: {
          id: 'tmLayoutLoad',
          onclick: "$('#tmLayoutLoadFile').click()",
        }
      },
      id: "tmLayout"
    }
  },

  data: {
      callbackFunctions: [],
      dataLinks: {},
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

  onDataLinksChanged: function(element){
      // TODO implement
  },

  layoutEdit: function(elem) {
    var clicks = $(elem).data('clicks');
    if (clicks) {
      $('.container').addClass("borderStyle");
      $('#mainDivIDE').addClass("borderStyle");
      $('.container').removeClass("editBorderStyle");
      $('#mainDivIDE').removeClass("editBorderStyle");
      $(elem).text('Edit'); 
      $('.layoutBlock').hide();
    } else {
      $('.container').removeClass("borderStyle");
      $('#mainDivIDE').removeClass("borderStyle");
      $('.container').addClass("editBorderStyle");
      $('#mainDivIDE').addClass("editBorderStyle");
      $(elem).html(' &#8594; Edit');
      $('.layoutBlock').show();
    }
    $(elem).data("clicks", !clicks);
  },

  // Other functions related to this panels
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

  removePanel: function (){
      parentElem = divIDE.ctxTarget;
      if (parentElem.id != 'main'){
          parentElem.remove();
      }
  },

  addPanel: function (){
      var parentElem = divIDE.ctxTarget;
      var classes = 'container contentPanel layoutPanel';
      if ($('#tmLayoutEdit').data('clicks')){
        classes += ' editBorderStyle'
      }
      divIDE.addPanel(parentElem, this, 'class="' + classes + '"');
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

  // Ready function

  ready: function(){
    $('#tmLayoutLoad').append('<input type="file" id="tmLayoutLoadFile" style="display: none;" />');
  }
}

// Initialization
// Setting up the main structure

// Panels need to be registered BEFORE foundation is imported
divIDE.registerPanel(main);  
divIDE.registerPanel(layout);  


// Setup whatever is required AFTER document is ready
$(document).ready(function(){

  NELEMENTS = 0;
  var TEST;

   
  var mainDivIDE = $("#mainDivIDE")[0];
  mainDivIDE.addEventListener("contextmenu", divIDE.showMenu, false);
  mainDivIDE.addEventListener("click", divIDE.clearMenu, false);
  $(mainDivIDE).addClass('borderStyle rowItems divIDELayout');
  $(mainDivIDE).attr('panelType', 'mainDivIDE')

});


// JQuery Magic
$(document).ready(function(){
    
    $('#tmLayoutSave').click(function(){
       exportLayout(); 
    });

    $('#tmLayoutLoadFile').change(function (e) {
        var layout;
        function callback(result) {
            layout = JSON.parse(result);
            TEST = layout;  // DEBUG TODO: remove this
            console.log("Remove above debugging line.")
            importLayout(layout);
        }
        divIDE.upload(e, callback);
        });
}); // end of document.ready


