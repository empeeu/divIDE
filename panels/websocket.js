webSocket = {
    name: "webSocketDataPanel", 
    panelHTML: function(uniqueParentElementID) {
        var html = '';
        return html;
    }, 
    panelAdminHTML: function(uniqueParentElementID) {
        var html = '';
        html += '\
            <input type="text" class="wsurl" id="';
        html += uniqueParentElementID;
        html += '-wsurl" value="ws://url:port"/>\
            <button class="button" type="button" onclick="webSocket.panelConnect(this)">\
                Connect\
            </button>\
        ';
        return html;
    }, 
    /*
    panelContextMenu: {
    },
    topMenuItems : {
    },
    */

    linkDataKeys: [
        'wsurl',
        'stringData',
        'binaryData'
    ],

    getPanelData: function(parentElement, key){
      if (key == 'wsurl'){
         var ta = $(parentElement).find('.wsurl');
         return ta.val();  
      } else if (key == 'stringData') { 
         var datakey = parentElement.find('.wsurl').attr('id')
         return divIDE.panelJSData[datakey].stringData;
      } else if (key == 'binaryData') { 
         var datakey = parentElement.find('.wsurl').attr('id')
         return divIDE.panelJSData[datakey].binaryData;
      }
    },

    setPanelData: function(parentElement, data, key) {
      if (key == 'wsurl'){
         var ta = $(parentElement).find('.wsurl');
         ta.val(data);  
         webSocket.panelConnect(parentElement);
      } else if (key == 'stringData') { 
         var datakey = parentElement.find('.wsurl').attr('id');
         try {
            return divIDE.panelJSData[datakey].ws.send(data);
         } catch(e) { 
            return '';
         }
      } else if (key == 'binaryData') { 
         var datakey = parentElement.find('.wsurl').attr('id');
         try {
            return divIDE.panelJSData[datakey].ws.send(data);
         } catch(e) {
             return '';
         }
      }

    },

    panelConnect: function(elem){
        var parentElement = divIDE.getCtxTarget(elem);
        var elem = $(parentElement).find('.wsurl');
        var datakey = elem.attr('id');
        var url = elem.val();
        divIDE.panelJSData[datakey] = {
            stringData: '',
            binaryData: '',
            ws: new WebSocket(url),
        }
        divIDE.panelJSData[datakey].ws.binaryType = 'arraybuffer';
        divIDE.panelJSData[datakey].ws.onmessage = function (e) {
            if (typeof e.data == 'string'){
                divIDE.panelJSData[datakey].stringData = e.data;
                divIDE.onLinkDataChange($(parentElement).parent('div'), 'stringData');
            } else {
                divIDE.panelJSData[datakey].binaryData = e.data;
                divIDE.onLinkDataChange($(parentElement).parent('div'), 'binaryData');
            }
        }
    }
}

divIDE.registerPanel(webSocket);