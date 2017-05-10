webSocket = {
    name: "webSocketDataPanel", 
    panelHTML: function(uniqueParentElementID) {
        var html = '';
        return html;
    }, 

    autoUrl: function(){
        var loc = window.location;
        var url = '';
        if (loc.protocol === "https:"){
            url = 'wss://';
        } else if (loc.protocol === "file:"){
            url = 'ws://localhost:8888'
        } else {
            url = 'ws://';
        }
        url += loc.host + '/ws';
        return url;
    },

    panelAdminHTML: function(uniqueParentElementID) {
        var html = '';
        html += '\
            <input type="text" class="wsurl" id="';
        html += uniqueParentElementID;
        html += '-wsurl" value="' + webSocket.autoUrl + '"/>\
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
        'binaryData',
        'jsonData'
    ],

    getPanelData: function(parentElement, key){
      if (key == 'wsurl'){
         var ta = $(parentElement).find('.wsurl');
         return ta.val();  
      } else if (key == 'stringData') { 
         var datakey = parentElement.find('.wsurl').attr('id')
         return divIDE.panelJSData[datakey].stringData;
      } else if (key == 'jsonData') { 
         var datakey = parentElement.find('.wsurl').attr('id')
         return divIDE.panelJSData[datakey].jsonData;
      } else if (key == 'binaryData') { 
         var datakey = parentElement.find('.wsurl').attr('id')
         return divIDE.panelJSData[datakey].binaryData;
      }
    },

    setPanelData: function(parentElement, data, key) {
      if (key == 'wsurl'){
         if (data === 'auto'){
             data = webSocket.autoUrl();
         }
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
      } else if (key == 'jsonData') { 
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
                try {
                    divIDE.panelJSData[datakey].jsonData = JSON.parse(e.data);
                    divIDE.onLinkDataChange($(parentElement).parent('div'), 'jsonData');
                } catch(error) {
                    divIDE.panelJSData[datakey].stringData = e.data;
                    divIDE.onLinkDataChange($(parentElement).parent('div'), 'stringData');
                }
            } else {
                divIDE.panelJSData[datakey].binaryData = e.data;
                divIDE.onLinkDataChange($(parentElement).parent('div'), 'binaryData');
            }
        }
    }
}

divIDE.registerPanel(webSocket);
