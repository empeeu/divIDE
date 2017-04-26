
// Define the main API
var divIDE = {
  nPanels: 0,
  // Support for right-click context menus
  ctxTarget: undefined,

  getCtxTarget: function (elem) {
    var ctx_target = elem;
    var panelType = $(elem).attr('panelType');
    if (panelType === undefined){
      var elem = elem.closest('[paneltype]');
    }
    return elem
  },

  showMenu: function (event){
    divIDE.clearMenu();
    divIDE.ctxTarget = divIDE.getCtxTarget($(event.target));
    var panelType = divIDE.ctxTarget.attr('panelType');
    var panelMenu = divIDE.panelTypes[panelType].showMenu;
    if (panelMenu === undefined){
      divIDE.showMenuType(panelType);
    } else {
      divIDE.panelTypes[panelType].showMenu(panelType, event);
    }
  },

  showMenuType: function(panelType){
      var ctxMenu = $("#" + panelType + "CtxMenu")[0];
      if (ctxMenu === undefined){
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

  panelJSData: {  // Container for storing javascript data objects for containers
  },

  panelDataChangeId: undefined,  // To avoid circular references when data changes
  panelDataChangeKey: undefined,  // To avoid circular references when data changes
  
  // Support for registering a new panel
  registerPanel: function (panel) {
    divIDE.panelTypes[panel.name] = panel;
    var topMenus = panel.topMenuItems;
    if (topMenus !== undefined){
      divIDE.addTopMenuItems(panel);
    }
    var ctxMenus = panel.contextMenuItems;
    if (ctxMenus !== undefined){
      divIDE.addContextMenuItems(panel);
    }
    var ready = panel.ready;
    if (ready !== undefined){
      panel.ready();
    }
    layout.populatePanelTypeSelectorOptions();
  },
  // Functions related to adding top and context menus
  // helper function for recursion
  _addSubMenus: function (menus, idprepend){
    if (idprepend === undefined){
      var idprepend = '';
    }
    var html = '';
    for (var key in menus){
      var attrs = '';
      for (var attrkey in menus[key]){
        if (attrkey === 'subMenus'){
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
    var changeLock=true;
    if (divIDE.panelDataChangeId != id && divIDE.panelDataLinks[id] != undefined){
      if (divIDE.panelDataChangeId === undefined){
        divIDE.panelDataChangeId = id;
        divIDE.panelDataChangeKey = key;
        changelock=false;
      }
      var data = divIDE.panelTypes[panelType].getPanelData(parentElem, key);

      var links = divIDE.panelDataLinks[id][key];
      for (var link in links) {
        var linkElem = $('#'+link);
        var linkPanelType = linkElem.attr('panelType');
        // Why the loop below? Well, the same from data can map to 
        // multiple keys in the to data. 
        // Think setting both the x and y data for a plot using the same input
        if (links[link] != undefined &&
               (linkElem.attr('id') != divIDE.panelDataChangeId ||
                links[link] != divIDE.panelDataChangeKey)){
          for (var i=0; i < links[link].length; i++){
            divIDE.panelTypes[linkPanelType].setPanelData(linkElem, data, links[link][i]);
            divIDE.onLinkDataChange(linkElem, links[link][i]);
          }
        }
      }
    }
    if (changeLock===false || id === divIDE.panelDataChangeId){
      divIDE.panelDataChangeId = undefined;  
    }    
  },

  addDataLink: function(elem){
    var elem = $(elem);
    var parentElem = elem.closest('div');
    var toPanelKey = parentElem.find('.toPanelKey');
    var fromPanelLink = parentElem.find('.fromPanelLink');
    var fromPanelKey = parentElem.find('.fromPanelKey');
    
    if (fromPanelKey.val() === '-1' && fromPanelLink.val() != '-1'){
      var panelType = $('#divIDEPanelNumber-' +
        fromPanelLink.val() + '-container').attr('panelType');
      if (panelType != undefined){
        var panel = divIDE.panelTypes[panelType];  
        fromPanelKey.html('<option value="-1"> --- </option>')
        var linkdatakeys = panel.linkDataKeys; 
        if (linkdatakeys != undefined){
          for (var i=0; i < linkdatakeys.length; i++){
            var key = linkdatakeys[i];
            fromPanelKey.append('<option value="' + key + '">' + key + '</option>');
          }
        }
      }
    }

    if (toPanelKey.val() === "-1" || fromPanelKey.val() === "-1" || fromPanelLink.val() === "-1"){
      return;
    }

    var fromID = 'divIDEPanelNumber-' + fromPanelLink.val() + '-container';
    var dl = divIDE.panelDataLinks[fromID];
    if (dl === undefined){
      divIDE.panelDataLinks[fromID] = {};
      dl = divIDE.panelDataLinks[fromID];
    }
    var dlk = dl[fromPanelKey.val()];
    if (dlk === undefined){
      dl[fromPanelKey.val()] = {};
      dlk = dl[fromPanelKey.val()];
    }
    var dlkt = dlk[parentElem.attr('id') + '-container'];
    if (dlkt === undefined){
      dlk[parentElem.attr('id') + '-container'] = [];
    }
    if (dlk[parentElem.attr('id') + '-container'].indexOf(toPanelKey.val()) >=0)
    {
      // Link already exists
      return;
    }
    dlk[parentElem.attr('id') + '-container'].push(toPanelKey.val());

    // Save data to panel by adding line and resetting fields
    var toPanelLink = parentElem.attr('id').split('-')[1];
    var layoutTable = parentElem.find('.layoutLinkSetup tbody');
    layoutTable.append('\
      <tr class="layoutLinked">\
      <td class="toPanelKeyLinked">' + toPanelLink + '.' + toPanelKey.val() + '</td>\
      <td class="fromPanelKeyLinked"><i class="fi-arrow-left"> ' + fromPanelLink.val() + '.' + fromPanelKey.val() + '</td>\
      <td><a href="#" class="layoutToolBarButton"\
             onclick="divIDE.removeDataLink(this)">\
             <i class="fi-unlink"></i></a></td></tr>');

    // Clean up container
    toPanelKey.val('-1');
    fromPanelKey.val('-1');
    fromPanelLink.val('-1');
  },

  removeDataLink: function(elem){
    var linkRowData = $(elem).closest('tr');
    var toPanelKeyLinked = linkRowData.find('.toPanelKeyLinked').text();
    var fromPanelKeyLinked = linkRowData.find('.fromPanelKeyLinked').text().split('.');
    var toPanelKey = toPanelKeyLinked[1];
    var toPanelLink = toPanelKeyLinked[0];
    var fromPanelKey = fromPanelKeyLinked[1];
    var fromPanelLink = fromPanelKeyLinked[0].substring(1); // substring because of space between data and arrow

    var fromID = 'divIDEPanelNumber-' + fromPanelLink + '-container';
    var toID = 'divIDEPanelNumber-' + toPanelLink + '-container';

    var dl = divIDE.panelDataLinks[fromID][fromPanelKey][toID];
    var index = dl.indexOf(toPanelKey);
    divIDE.panelDataLinks[fromID][fromPanelKey][toID].splice(index, 1);
    if (divIDE.panelDataLinks[fromID][fromPanelKey][toID].length === 0){
      delete divIDE.panelDataLinks[fromID][fromPanelKey][toID];
    }
    linkRowData.remove();
  },


  // Saving and Loading functions
  getPanelContents: function (elem){
    var elem = $(elem);
    var panelType = elem.attr('panelType')
    var contents = {data: {},
                    children: {},
                    attrs: {
                      panelType: elem.attr('panelType'),
                      class: elem.attr('class'),
                      id: elem.attr('id'),
//                       style: elem.attr('style'),
                    }
    };
    var dataKeys = divIDE.panelTypes[panelType].linkDataKeys;
    if (dataKeys != undefined){
      for (var i=0; i < dataKeys.length; i++){
        var key = dataKeys[i];
        contents.data[key] = divIDE.panelTypes[panelType].getPanelData(elem, key);
      }
    }
    var children = $(elem).children('div[panelType]');
    for (var i = 0; i < children.length; i++){
      var child = $(children[i]);
      contents.children[$(child).attr('id')] = divIDE.getPanelContents(child);
    }
    return contents;
  },

  setPanelContents: function(layoutObj){
    var key = layoutObj.attrs['id'];
    var elem = $('#' + key);
    var panelType = layoutObj.attrs.panelType

    // Set attrs
    for (var attr in layoutObj.attrs){
//       console.log(key + ' ' + attr + ': ' + layoutObj.attrs[attr] )
      elem.attr(attr, layoutObj.attrs[attr]);
    }

    // Set data
    if (divIDE.panelTypes[panelType].setPanelData != undefined){
      for (var dataKey in layoutObj.data){
        divIDE.panelTypes[panelType].setPanelData(
          elem,
          layoutObj.data[dataKey],
          dataKey
        );  
      }
    }

    for (var childKey in layoutObj.children){
      var child = layoutObj.children[childKey];
      var cPanelType = child.attrs.panelType;
      if (cPanelType === layout.name){
        divIDE.ctxTarget = divIDE.getCtxTarget(elem);
        layout.addPanel(child.attrs.id);
        $('#'+child.attrs.id).attr('class', child.attrs.classes);
      } else {
        var selectorElem = elem.find('.panelTypeSelector');
        selectorElem.val(cPanelType);
        layout.setPanelType(selectorElem);
      }
      divIDE.setPanelContents(child);
    }
  },

  populateDataLinks: function(){
    for (var fromPanel in divIDE.panelDataLinks){
      for (var fromKey in divIDE.panelDataLinks[fromPanel]){
        for (var toPanel in divIDE.panelDataLinks[fromPanel][fromKey]){
          for (var i=0; i < divIDE.panelDataLinks[fromPanel][fromKey][toPanel].length; i++){
            var toKey = divIDE.panelDataLinks[fromPanel][fromKey][toPanel][i];
            var elem = $('#' + toPanel.replace('-container', ''));
            $(elem).find('.toPanelKey').val(toKey);
            $(elem).find('.fromPanelLink').val(fromPanel);
            $(elem).find('.fromPanelKey').val(fromKey);
            var layoutTable = $(elem).find('.layoutLinkSetup tbody');
                      layoutTable.append('\
              <tr class="layoutLinked">\
              <td class="toPanelKeyLinked">' + toPanel.split('-')[1] + '.' + toKey + '</td>\
              <td class="fromPanelKeyLinked"><i class="fi-arrow-left"> ' + fromPanel.split('-')[1] + '.' + fromKey + '</td>\
              <td><a href="#" class="layoutToolBarButton"\
                     onclick="divIDE.removeDataLink(this)">\
                     <i class="fi-unlink"></i></a></td></tr>');     
          }
        }
      }
    }
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
//     File: {
//       subMenus: {
//         Open: {
//           id: 'tmFileOpen'
//         },
//         Recent: {
//           id: 'tmFileRecent',
//           subMenus: {
//             item1: {
//               id: 'item1'
//             },
//             item2: {
//               id: 'item2'
//             }
//           }
//         }
//       },
//       id: "tmFile"
//     }
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
      <div class='layoutToolbarButtons tiny button-group'>\
        <a href='#' class='layoutToolBarButton button' onclick='layout.alignToggle(this)' style='display:none;'>\
          <i class='fi-minus'></i></a>\
        <a href='#' class='layoutToolBarButton button' onclick='layout.addPanelButton(this)' style='display:none;'>\
          <i class='fi-plus'></i></a>\
      </div>\
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
        <div class='layoutToolbarButtons tiny button-group'>\
          <a href='#' class='layoutToolBarButton button hollow secondary'>\
            " + elId.split('-')[1] + "</a>\
          <a href='#' class='layoutToolBarButton button' data-toggle='" + elId + "sizeDrop'>\
            <i class='fi-list'></i></a>\
          <a href='#' class='layoutToolBarButton button' onclick='layout.alignToggle(this)'>\
            <i class='fi-minus'></i></a>\
          <a href='#' class='layoutToolBarButton button' onclick='layout.addPanelButton(this)'>\
            <i class='fi-plus'></i></a>\
          <a href='#' class='layoutToolBarButton button' data-toggle='" + elId + "linkDrop'>\
            <i class='fi-link'></i></button>\
          <a href='#' class='layoutToolBarButton button' onclick='layout.removePanelButton(this)'>\
            <i class='fi-x'></i></a>\
        </div> \
          \
      <table class='layoutToolBar dropdown-pane' id='" + elId + "sizeDrop' data-dropdown data-options='closeOnClick:true;'><tbody> \
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
      \
      <table class='layoutToolBar dropdown-pane layoutLinkSetup' id='" + elId + "linkDrop' data-dropdown data-options='closeOnClick:true;'><tbody> \
      <tr><th>To Key</th><th>From Panel #</th><th>From Key</th></tr>\
      <tr>\
        <td>\
        <select class='toPanelKey' onchange='divIDE.addDataLink(this)'> \
                <option value='-1'>---</option> \
               </select> \
        </td>\
        <td>\
        <select class='fromPanelLink' onchange='divIDE.addDataLink(this)'> \
                <option value='-1'>---</option> \
               </select> \
        </td>\
        <td>\
        <select class='fromPanelKey' onchange='divIDE.addDataLink(this)'> \
                <option value='-1'>---</option> \
               </select> \
        </td>\
      </tr>\
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
        },
        Admin: {
          id: 'tmLayoutAdmin',
          onclick: "layout.layoutAdmin(this)",
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

  linkDataKeys: [
      'width',
      'height'
  ],

  getPanelData: function(elem, key) {
    var trs = $(elem).find('tr');
    var data;
    var i = 0;
    if (key === 'width'){
      i = 0;
    }
    if (key === 'height'){
      i = 1;
    }
    var val = $(trs[i]).find('input').val();
    var unit = $(trs[i]).find('select').val();
    data = {size: val, unit: unit};

    return data;
  },

  setPanelData: function(parentElem, data, key){
    var trs = $(parentElem).find('tr');
    var i = 0;
    if (key === 'width'){
      i = 0;
    }
    if (key === 'height'){
      i = 1;
    }
    $(trs[i]).find('input').val(parseInt(data.size));
    layout.boxWidthChange($(trs[i]).find('input'));
    $(trs[i]).find('select').val(data.unit);
    layout.boxWidthChange($(trs[i]).find('select'));

  },


  // Other functions related to this panel specifically, not part of the divIDE interface...
  panelTypeSelectorOptions: '', // The registered panel types will go here

  populatePanelTypeSelectorOptions: function (){
    layout.panelTypeSelectorOptions = '';
    for (var key in divIDE.panelTypes) {
      if (key === main.name || key === layout.name){
        continue;
      }
      layout.panelTypeSelectorOptions += " \
           <option value='" +  key + "'> " + key + " </option>";
    }
  },

  layoutEdit: function(elem) {
    // Turn off layout admin mode if it is active
    if ($('#tmLayoutAdmin').data('clicks')){
      layout.layoutAdmin($('#tmLayoutAdmin'));
    }
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

  layoutAdmin: function(elem) {
    // Turn off layout edit mode if it is active
    if ($('#tmLayoutEdit').data('clicks')){
      layout.layoutEdit($('#tmLayoutEdit'));
    }
    var clicks = $(elem).data('clicks');
    if (clicks) {
      $(elem).text('Admin'); 
      $('.divIDEAdmin').hide();
//       $('.divIDEPanel').css('display', 'flex');
    } else {
      $(elem).html(' &#8594; Admin');
      $('.divIDEAdmin').show();
//       $('.divIDEPanel').hide();
    }
    $(elem).data("clicks", !clicks);
  },


  boxSizeChange: function (melem, wh){
      var elem = $(melem).closest('div');
      var tr = $(melem).closest('tr');
      var unit = $(tr).find('select')[0].value;
      var size = $(tr).find('input')[0].value;
      if (unit === 'flex'){
          elem.css('flex', size);
          elem.css('max-' + wh, '');
          elem.css('min-' + wh, '');
          inputs = elem.find('input');
          for (var i = 0; i < inputs.length; i++){
              var u = $(inputs[i]).closest('tr').find('select')[0].value;
              if (u === 'flex'){
                  inputs[i].value = size;
              }
          }
      } else if (unit === 'px') {
          elem.css('flex', '');
          elem.css('max-'+ wh, size + unit);
          elem.css('min-'+ wh, size + unit);
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
      var parentElem = divIDE.ctxTarget;
      var id = $(parentElem).attr('id');
      // if it has any children, let's grab those ids as well
      var childElems = $(parentElem).find('[panelType=DivIDELayout]');
      var ids = [];
      for (var i=0; i < childElems.length; i++){
        ids.push(childElems[i].id.split('-')[1]);
      }
      ids.push(id.split('-')[1]);

        // Remove this panel number and children as a fromdata link options
       var panelN = id.split('-')[1];
       var panellinks = $('.layoutLinked .fromPanelKeyLinked i');
       for (var i = 0; i < panellinks.length; i++){
         var linkN = panellinks[i].innerHTML.split('.')[0].substring(1);
         if (ids.indexOf(linkN) !== -1){
           divIDE.removeDataLink(panellinks[i]);
         }
       }
       panellinks = $('.layoutLinkSetup');
       var oprem = panellinks.find('option[value=' + id.split('-')[1] + ']');
       oprem.remove();
       delete divIDE.panelDataLinks[id + '-container'];
       for (var i = 0; i < childElems.length; i++){
         var id2 = $(childElems[i]).attr('id').split('-')[1];
         delete divIDE.panelDataLinks[childElems[i].id + '-container'];
         var oprem = panellinks.find('option[value=' + id2 + ']');
         oprem.remove();
       }

       // Remove this panel number and children as todata link options
       panellinks = $('.layoutLinked .toPanelKeyLinked i');
       for (var i = 0; i < panellinks.length; i++){
         var linkN = panellinks[i].innerHTML.split('.')[0];
         if (ids.indexOf(linkN) !== -1){
           divIDE.removeDataLink(panellinks[i]);
         }
       }

      if (id != 'main'){
          parentElem.remove();
      }
  },

  addPanelButton: function (elem) {
    divIDE.ctxTarget = divIDE.getCtxTarget(elem);
    this.addPanel();    
  },

  addPanel: function (elId){
    var parentElem = $(divIDE.ctxTarget);
    var classes = this.name + ' rowItems';
    if ($('#tmLayoutEdit').data('clicks')){
      classes += ' editBorderStyle'
    } else {
      classes += ' BorderStyle';
    }

//     var elId = $(parentElem).attr('id') + '-' + $(parentElem).children().length;
    if (elId === undefined){
      var elId = "divIDEPanelNumber-" + divIDE.nPanels;
    }
    // Add this as a potential link for other panels
    var lls = $('.layoutLinkSetup').find('.fromPanelLink');
    lls.append('<option value="' + divIDE.nPanels + '">' + divIDE.nPanels + '</option>')
    
    // Grab the template layout element
    var template = this.panelHTML(elId);


    parentElem.append(template);

    var div = parentElem.children()[parentElem.children().length - 1];
    $(div).attr('id', elId);
    $(div).attr('panelType', this.name);
    $(div).addClass(classes);
    $(div).foundation();

    // Populate this panel's link options
    lls = $(div).find('.fromPanelLink');
    var activePanels = $('.DivIDELayout[panelType=DivIDELayout]');
    for (var i=0; i<activePanels.length; i++){
      var key = $(activePanels[i]).attr('id').split('-')[1];
      if (key != divIDE.nPanels){
        lls.append('<option value="' + key + '">' + key + '</option>');
      }
    }

    divIDE.nPanels += 1;  // Increment the number of panels this document has seen
  },

  setPanelType: function(elem){
    var parentElem = $(divIDE.getCtxTarget(elem));
    var panelType = $(elem).val();
    var panelDiv = parentElem.find('[panelType]');
    var parentId = parentElem.attr('id')
    if (panelType === layout.name) {
      // remove any existing divs
      panelDiv.remove();
      return;
    } else if (panelType === panelDiv.attr('panelType')) {
      // Already this type
      return;
    }
    var div;
    var panel = divIDE.panelTypes[panelType];

    div = document.createElement('div');
    $(div).attr('panelType', panelType);
    $(div).attr('id', parentElem.attr('id') + '-container')
    $(div).addClass('divIDEPanel');
    $(div).addClass(panel.name);
    $(div).html(panel.panelHTML(parentElem.attr('id')));
    parentElem.append(div);
    
    if (panel.panelAdminHTML != undefined){
      var div2 = document.createElement('div');
      $(div2).attr('panelType', panelType);
      $(div2).attr('id', parentId + '-container-admin')
      $(div2).addClass('divIDEAdmin');
      $(div2).addClass(panel.name);
      $(div2).html(panel.panelAdminHTML(parentId));
      $(div).append(div2);
    }

    // Add key options to data links toolbar
    var datakey = parentElem.find('.toPanelKey');
    var linkdatakeys = panel.linkDataKeys; 
    for (var i=0; i < linkdatakeys.length; i++){
      var key = linkdatakeys[i];
      datakey.append('<option val="' + key + '">' + key + '</option>');
    }

    // Do any initialization for the particular panel of this panelType
    if (panel.init != undefined){
      panel.init(parentId + '-container');
    }

  },

  alignToggle: function(elem){
    divIDE.ctxTarget = $(divIDE.getCtxTarget(elem));
    if (divIDE.ctxTarget.hasClass('rowItems')){
      layout.alignVertical();
      $(elem).html('<div style="transform: rotate(90deg)"><i class="fi-minus"></i></div>');  
    } else {
      layout.alignHorizontal();
      $(elem).html('<i class="fi-minus"></i>');
    }

  },

  alignVertical: function (melem){
      var elem = divIDE.ctxTarget;
      elem.removeClass("rowItems")
      elem.addClass("columnItems")
  },

  alignHorizontal: function (melem){
      var elem = divIDE.ctxTarget;
      elem.removeClass("columnItems")
      elem.addClass("rowItems")
  },

  // Loading and Saving
  exportLayout: function(){
    // Build the json structure defining the layout
    var main = $('#mainDivIDE');
    var layout = {
      mainDivIDE: divIDE.getPanelContents(main),
      panelDataLinks: divIDE.panelDataLinks,
      nPanels: divIDE.nPanels
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
      divIDE.panelDataLinks = layoutObj.panelDataLinks;
      // The correct number of panels should naturally be populated, we can check this at the end
      divIDE.nPanels = 0; //layoutObj.nPanels;
      // clear everything
      $('#mainDivIDE').html("\
        <div class='layoutToolbarButtons tiny button-group'>\
          <a href='#' class='layoutToolBarButton button' onclick='layout.alignToggle(this)'>\
            <i class='fi-minus'></i></a>\
          <a href='#' class='layoutToolBarButton button' onclick='layout.addPanelButton(this)'>\
            <i class='fi-plus'></i></a>\
        </div>\
       ");
      divIDE.setPanelContents(layoutObj.mainDivIDE);
      divIDE.populateDataLinks();
      layout.layoutEdit($('#tmLayoutEdit'));
      layout.layoutEdit($('#tmLayoutEdit'));
      if (divIDE.nPanels !== layoutObj.nPanels){
        alert('Unknown Layout Import Error. ' + divIDE.nPanels + '!=' + layoutObj.nPanels);
      }
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


// Load Foundation to style app, passes in jquery as parameter
$(document).foundation()


