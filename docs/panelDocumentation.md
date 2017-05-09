# TextArea

This is the most basic panel that allows a simple `textarea` `html` element. The only available *datalink* is ***text*** and the panel will send updates `oninput` -- that is, whenever a user types something. 

# Websocket

This panel can be used to establish a websocket connection. It does not necessarily need to be displayed (i.e. set `width` of panel to `0`). 

In order to establish a connection, the user must press the `connect` button from the panel's `admin` view, or use `setPanelData` to update the ***wsurl***

This panel has the following *datalinks* available, and these are their descriptions:

***wsurl***: *String*

  * This is the websocket url. If this is set to `auto`, the url will be automatically determined using `window.location/ws`. For example: if the page is server from https://www.exampleserver.com, the websocket will try to connect to wss://www.exampleserver.com/ws
  * Whenver this is set, the websocket will attempt to connect to the url specified.
  
***stringData***: *String*

  * Setting string data using `setPanelData` to this datalink will send a message across the websocket. When the websocket receives string data, that data is populated here, and can be retrieved using `getPanelData`.  
    
***binaryData***: *arraybuffer*

  * Setting binary data using `setPanelData` to this datalink will send a message across the websocket. When the websocket receives binary data, that data is populated here, and can be retrieved using `getPanelData`.  
  
***jsonData***: *object*

  * Setting object data using `setPanelData` to this datalink will send a message across the websocket. When the websocket receives string data, it tries to parse the string as a JSON object. If that parsing succeeds, that data is populated here, and can be retrieved using `getPanelData`.  

# PointCloud

This panel will display point data specified in string or binary format. This panel uses `THREE.JS`, which is built on top of `WebGL`, giving fast renderings that leverage the system's graphics card. 

This panel has the following *datalinks* available, and these are their descriptions: 

***stringGeometry***: *Array*

  * This is used to define the geometry that will be displayed. 
  * The format of this data should follow one of the following:
      * xyz (colored by `z`)
      * xyzi (colored by intensity `i`)
      * xyzrgb (colored by specified `red`, `blue`, `green`)
  * For example, for `n` points 
```javascript
xyz=[
	    [x1, y1, z1],
	    [x2, y2, z2],
	    ...
	    [xn, yn, zn]
]
xyzi=[	
	    [x1, y1, z1, I1],
	    [x2, y2, z2, I2],
	    ...
	    [xn, yn, zn, In]
]
xyzrgb=[	
	    [x1, y1, z1, r1, g1, b1],
	    [x2, y2, z2, r2, g2, b2],
	    ...
	    [xn, yn, zn, rn, gn, bn]
]

```

***binaryGeometry***

  * This is used to define the geometry that will be displayed.
  * The datatype is assumed to be `Float32`
  * The first row should contain `header` information [nColumns, ...]:
     * The first number is a `Float32` giving the number of columns
        * If the number of columns == 3 then the `xyz` format is assumed
        * If the number of columns == 4 then the `xyzi` format is assumed
        * If the number of columns == 6 then the `xyzrgb` format is assumed
        * Otherwise no explicit error will be thrown, but unexpected behaviour may result. In particular, the coloring will be off. 
     * The remaining numbers in the first row are ignored
     
***status***: *String*

  * When the geometry is being updated, this will read "busy"
  * When the geometry is finished being updated, this will read "ready"
  
***binaryDrawType**: *String*

  * This sets the type of point-cloud updating, there are two types available:
     * "match": When points are set, those points will be displayed.
     * "fill": When points are set, they are added to any previously points displayed up to the `pcMaxRange` number of points. 
     
> ***Notes***: This panel assumes that **EITHER** points will be defined using the ***stringGeometry*** OR ***binaryGeometry***, not both. 

## Notes
There's a plethora of useful data stored in this panel's `divIDE.panelJSData[elID]`, where `elID` is the panel's parent div `id`. In particular:
  * The `material` for the pointcloud is stored here, and the `material.size` attribute controls the size of the point-cloud points. 
  * The `controls.target` vector defines what the camera is looking at.
  * The `camera.position` vector defines the position of the camera.