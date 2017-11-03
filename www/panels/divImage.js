divImage = {
    name: "divImage", 
    panelHTML: function(uniqueParentElementID) {
        var html = '';
        html += "<!--div \
                 style='overflow:hidden;\
                 height: fit-content;width: fit-content;\
                 width: 100%; height:100%;\
                 margin-top:auto;margin-bottom:auto;\
                 margin-left: auto;margin-right: auto;'>\
                 <img src=''\
                    style='object-fit:contain;max-width:100%;\
                    max-height:100%;image-rendering: pixelated;\
                    transform: matrix(1, 0, 0, 1, 0, 0);\
                    user-drag: none; user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;'\
                    onmousedown='divImage.startPan(this, event)'\
                    onmousemove='divImage.pan(this, event)'\
                    onmouseup='divImage.stopPan(this, event)'\
                    onmouseout='divImage.stopPan(this, event)'\
                    draggable=false\
                 /></div-->\
                 <div style='width:fit-content; height:fit-content; object-fit:contain; overflow:hidden;\
                        margin-top:auto;margin-bottom:auto;\
                        margin-left: auto;margin-right: auto;'>\
                     <canvas id='imageCanvas' style='width:100%;height:100%;object-fit:contain;image-rendering: pixelated;\
                            transform: matrix(1, 0, 0, 1, 0, 0);\
                            user-drag: none; user-select: none;-moz-user-select: none;-webkit-user-drag: none;-webkit-user-select: none;-ms-user-select: none;'\
                            onmousedown='divImage.startPan(this, event)'\
                            onmousemove='divImage.pan(this, event)'\
                            onmouseup='divImage.stopPan(this, event)'\
                            onmouseout='divImage.stopPan(this, event)'\
                            draggable=false\
                            height=3 width=3/>\
                 </div>"
        return html
    }, 
/*    panelContextMenu: function(parentElement) {
        // TODO implement     
    },
    topMenuItems : {
        
    },*/
    startPan(elem, event){
        var parentElement = $(divIDE.getCtxTarget(elem));
        var elID = parentElement.attr('id'); 
        divIDE.panelJSData[elID].panStart = [event.clientX, event.clientY];
    },

    stopPan(elem, event){
        var parentElement = $(divIDE.getCtxTarget(elem));
        var elID = parentElement.attr('id'); 
        divIDE.panelJSData[elID].panStart = undefined;
    },

    pan(elem, event){
        var parentElement = $(divIDE.getCtxTarget(elem));
        var elID = parentElement.attr('id'); 
        var startPan = divIDE.panelJSData[elID].panStart;
        if (startPan == undefined){
            return;
        }
        var translate = [event.clientX - startPan[0], event.clientY - startPan[1]];
        var matrix = $(elem).css('transform').replace('matrix(', '').replace(')', '').split(',');
        var scale = parseFloat(matrix[0]);
        var width = (scale - 1) * elem.clientWidth / 2;
        var height = (scale - 1) * elem.clientHeight / 2;
        if (event.ctrlKey)
        {
            var newScale;
            if (translate[1] < -1){
                newScale = scale * 1.1;
                divImage.startPan(elem, event); // Restart for next round
            } else if (translate[1] > 1) {
                newScale = Math.max(1, scale / 1.1);
                divImage.startPan(elem, event); // Restart for next round
            }
            matrix[0] = String(newScale);
            matrix[3] = String(newScale);
            matrix[4] = String(Math.min(width, Math.max(-width, newScale / scale * parseInt(matrix[4]))));
            matrix[5] = String(Math.min(height, Math.max(-height, newScale / scale * parseInt(matrix[5]))));  
            if (scale == 1){
                matrix[4] = '0';
                matrix[5] = '0';    
            }
        } else {
            divImage.startPan(elem, event); // Restart for next round
            matrix[4] = String(Math.min(width, Math.max(-width, parseInt(matrix[4]) + translate[0])));
            matrix[5] = String(Math.min(height, Math.max(-height, parseInt(matrix[5]) + translate[1])));            
        }
//         console.log(matrix)
        // if (matrix[0] == 1) { return; }
        $(elem).css('transform', 'matrix(' + matrix.join(',') + ')');
    },

    linkDataKeys: [
        'imgData',
        'canvasData',
        'imgArray',
        'imgStrArray',
        'vmin', 
        'vmax', 
        'colormap',
        'equalize'
    ],

    _asLittleEndianHex: function (value, bytes) {
        // FROM: https://mrcoles.com/low-res-paint/
        // Convert value into little endian hex bytes
        // value - the number as a decimal integer (representing bytes)
        // bytes - the number of bytes that this value takes up in a string

        // Example:
        // _asLittleEndianHex(2835, 4)
        // > '\x13\x0b\x00\x00'

        var result = [];

        for (; bytes>0; bytes--) {
            result.push(String.fromCharCode(value & 255));
            value >>= 8;
        }

        return result.join('');
    },

    _collapseData: function (rows, row_padding) {
        // FROM: https://mrcoles.com/low-res-paint/
        // Convert rows of RGB arrays into BMP data
        var i,
            rows_len = rows.length,
            j,
            pixels_len = rows_len ? rows[0].length : 0,
            pixel,
            padding = '',
            result = [];

        for (; row_padding > 0; row_padding--) {
            padding += '\x00';
        }

        for (i=0; i<rows_len; i++) {
            for (j=0; j<pixels_len; j++) {
                pixel = rows[i][j];
                result.push(String.fromCharCode(pixel[2]) +
                            String.fromCharCode(pixel[1]) +
                            String.fromCharCode(pixel[0]));
            }
            result.push(padding);
        }
        return result.join('');
    },

    _uIntArray2Bitmap(data){
        var height = data.length,
            width = height ? data[0].length : 0,
            row_padding = (4 - (width * 3) %4) %4,
            num_data_bytes = (width * 3 + row_padding) * height,
            num_file_bytes = 54 + num_data_bytes,
            file, 
            image;
        height = divImage._asLittleEndianHex(height, 4);
        width = divImage._asLittleEndianHex(width, 4);
        num_data_bytes = divImage._asLittleEndianHex(num_data_bytes, 4);
        num_file_bytes = divImage._asLittleEndianHex(num_file_bytes, 4);

        file = ('BM' +               // "Magic Number"
                num_file_bytes +     // size of the file (bytes)*
                '\x00\x00' +         // reserved
                '\x00\x00' +         // reserved
                '\x36\x00\x00\x00' + // offset of where BMP data lives (54 bytes)
                '\x28\x00\x00\x00' + // number of remaining bytes in header from here (40 bytes)
                width +              // the width of the bitmap in pixels*
                height +             // the height of the bitmap in pixels*
                '\x01\x00' +         // the number of color planes (1)
                '\x18\x00' +         // 24 bits / pixel
                '\x00\x00\x00\x00' + // No compression (0)
                num_data_bytes +     // size of the BMP data (bytes)*
                '\x13\x0B\x00\x00' + // 2835 pixels/meter - horizontal resolution
                '\x13\x0B\x00\x00' + // 2835 pixels/meter - the vertical resolution
                '\x00\x00\x00\x00' + // Number of colors in the palette (keep 0 for 24-bit)
                '\x00\x00\x00\x00' + // 0 important colors (means all colors are important)
                divImage._collapseData(data, row_padding)
       );
       return 'data:image/bmp;base64,' + btoa(file);
    },

    _colorArray(data, parentElement, vmin=undefined, vmax=undefined, lut='grayscale', equalize=false){
        var elID = parentElement.attr('id'); 
        var height = data[0],
            width = data[1],
            n_elm = data[2];
            dataSlice = data.slice(3, width*height+3);
        if (n_elm == 3 | n_elm == 4){
            return data;
        }
        if (n_elm != 1){
            console.log('Unsupported number of pixel elements', n_elm);
        }
        if (typeof lut == "string"){
            var numberOfColors = 256;
            if (lut in THREE.ColorMapKeywords){
                var lut = new THREE.Lut(lut, numberOfColors);
            } else { 
                var lut = new THREE.Lut('grayscale', numberOfColors);
            }
        }
        if (vmin == undefined){
            var vmin = Infinity;
            for (var i = 0; i < dataSlice.length; i++){
                if (dataSlice[i] < vmin){
                    vmin = dataSlice[i];                
                }
            }
        }
        if (vmax == undefined){
            var vmax = -Infinity;
            for (var i = 0; i < dataSlice.length; i++){
                if (dataSlice[i] > vmax){
                    vmax = dataSlice[i];
                }
            }
        }
        if (equalize){
            lut.setMax(255);
            lut.setMin(0)
            vmax = 255;
            vmin = 0;
        } else {
            lut.setMax ( vmax + 1 * (vmax == vmin) );
            lut.setMin ( vmin );
        }

        var eqData;
        if (equalize){
            // Create the histogram of values
            var histogram = {};
            var step = (vmax - vmin) / 255;
            var val, cdf = {};
            for (var i = 0; i < dataSlice.length; i++){
                val = Math.round(dataSlice[i] / step);
                if (histogram[val] == undefined){
                    histogram[val] = 0;
                }
                histogram[val] += 1;
            }
            // calculate the cdf
            var last_val = 0;
            var cdfmin = Infinity;
            var cdfmax = 0;
            for (var i = 0; i <= 255; i++){
                if (histogram[i] == undefined){
                    continue;
                }
                cdf[i] = histogram[i] + last_val;
                last_val = cdf[i];
                cdfmin = Math.min(cdf[i], cdfmin);
                cdfmax = cdf[i];
            }
            // Equalize data
            eqData = divIDE.panelJSData[elID].eqData;
            if (eqData === undefined || eqData.length != dataSlice.length){
                eqData = new Uint8ClampedArray(dataSlice.length);
                divIDE.panelJSData[elID].eqData = eqData;
            }
            for (var i = 0; i < dataSlice.length; i++){
                    val = Math.round(dataSlice[i] / step);
                    val = (cdf[val] - cdfmin) / (cdfmax - cdfmin) * (vmax - vmin) + vmin;
                    eqData[i] = val;
            }
        } else {
            eqData = dataSlice;
        }
        var newData = divIDE.panelJSData[elID].newColData;
        if (newData === undefined || newData.length != (3+height*width*4)){
            newData = new Uint16Array(3+height*width*4);
            divIDE.panelJSData[elID].newColData = newData;
        }

        newData[0] = height
        newData[1] = width
        newData[2] = 4;
        var j = 3;
        for (var i = 0; i < height*width; i++){
            var c = lut.getColor (eqData[i]);
            if (c == undefined){
                newData[j+0] = 0;
                newData[j+1] = 0;
                newData[j+2] = 0;
                newData[j+3] = 255;
            } else {
                newData[j+0] = Math.round(c.r * 255);
                newData[j+1] = Math.round(c.g * 255);
                newData[j+2] = Math.round(c.b * 255);
                newData[j+3] = 255;
            }
            j += 4;
        }
        return newData;
    },

    getPanelData: function(parentElement, key){
      if (key == 'imgData'){
         var img = $(parentElement).find('img');
         return img.val();  
      } else { 
         return;
      }
    },

    to1DArray: function(arr){
        if (arr[0][0] === undefined){
            return arr; //already 1d
        }
        var new1DArr = [];
        new1DArr.push(arr.length);
        new1DArr.push(arr[0].length);
        var is3d = false;
        if (arr[0][0][0] !== undefined){
            new1DArr.push(arr[0][0].length);
            is3d = true;
        } else {
            new1DArr.push(1);
        }
        for (var i = 0; i < new1DArr[0]; i++){
            for (var j = 0; j < new1DArr[1]; j ++){
                for (var k = 0; k < new1DArr[2]; k++){
                    if (is3d){
                        new1DArr.push(arr[i][j][k]);
                    }
                    else {
                        new1DArr.push(arr[i][j]);
                    }
                }
            }
        }
        return new1DArr;
    },

    _updateImage(data, parentElement, vmin=undefined, vmax=undefined, colormap=undefined, equalize=undefined){
        var elID = parentElement.attr('id'); 
        if (vmin == undefined){
            var vmin = divIDE.panelJSData[elID].vmin;
        }
        if (vmax == undefined){
            var vmax = divIDE.panelJSData[elID].vmax;
        }
        if (colormap == undefined){
            var colormap = divIDE.panelJSData[elID].colormap;
        }
        if (equalize == undefined){
            var equalize = divIDE.panelJSData[elID].equalize;
        }
        data = divImage._colorArray(data, parentElement, vmin, vmax, colormap, equalize);
        divImage.setPanelData(parentElement, data, 'canvasData');
    },

    _updateCanvas: function (data, elem){
        var c = $(elem).find('canvas')[0];    
        var ctx=c.getContext("2d");
        var width = data[0];
        var height = data[1];
        var elems = data[2];
        if (elems < 3){
            console.log("Need to specify at least RGB");
        }
        c.width = width;
        c.height = height;
        if (elems == 4){
            var imgData = new ImageData(new Uint8ClampedArray(data.slice(3, width*height*4 + 4)),
                width, height);
        } else {
            var imgData = ctx.createImageData(width, height);
            var j = 3;
            for (var i=0; i < imgData.data.length; i++){
                imgData.data[i] = data[j];
                j++;
                if ((i+2)%4 == 0){
                    i++;
                    imgData.data[i] = 255;
                } 
                if (j == data.length){
                    break;
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    },

    setPanelData: function(parentElement, data, key) {
      var elID = parentElement.attr('id'); 
      if (key == 'imgData'){
        var img = $(parentElement).find('img');
        img.attr('src', data);  
      }
      else if (key == 'canvasData') {
          divImage._updateCanvas(data, parentElement);
      }
      else if (key == 'imgStrArray'){
        data = eval(data);
        data1d = divImage.to1DArray(data);
        if (data1d[2] == 1){
            divIDE.panelJSData[elID].arrayData = data;
           divImage._updateImage(data1d, parentElement);
        }
        else {
            divImage._updateCanvas(data1d, parentElement);           
        } 
      }
      else if (key == 'imgArray'){
         divIDE.panelJSData[elID].arrayData = data;
         divImage._updateImage(data, parentElement);
      } else if (key == 'vmin') {
          divIDE.panelJSData[elID].vmin = parseFloat(data);
          divImage._updateImage(divIDE.panelJSData[elID].arrayData, parentElement);
      } else if (key == 'vmax') {
          divIDE.panelJSData[elID].vmax = parseFloat(data);
          divImage._updateImage(divIDE.panelJSData[elID].arrayData, parentElement);
      } else if (key == 'colormap') {
          divIDE.panelJSData[elID].colormap = data;
          divImage._updateImage(divIDE.panelJSData[elID].arrayData, parentElement);
      } else if (key == 'equalize'){
          divIDE.panelJSData[elID].equalize = data;
          divImage._updateImage(divIDE.panelJSData[elID].arrayData, parentElement);
      }
    }, 

    init: function(elID){
        divIDE.panelJSData[elID] = {
            vmin: undefined,
            vmax: undefined,
            colormap: 'grayscale',
            equalize: false,
            arrayData: [[1]],
        }
    }
}

divIDE.registerPanel(divImage);
