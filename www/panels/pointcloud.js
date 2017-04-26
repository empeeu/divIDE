pointCloud = {
    name: "PointCloud", 
    curElID: undefined,
    panelHTML: function(uniqueParentElementID) {
        var html = '';
        html += ""
        return html;
    }, 
    /*
    panelContextMenu: function(parentElement) {
        // TODO implement     
    },
    topMenuItems : {
        
    },*/

    linkDataKeys: [
        'stringGeometry',
        'binaryGeometry',
        'status',
        'binaryDrawType',
    ],

    getPanelData: function(parentElement, key){
      var container = $(divIDE.getCtxTarget(parentElement));
      var elID = container.attr('id'); 
      if (key == 'stringGeometry'){
         return;  
      } else if (key == 'binaryGeometry') { 
         return;
      } else if (key == 'status') {
          return divIDE.panelJSData[elID].status;
      } else if (key == 'binaryDrawType') {
          return divIDE.panelJSData[elID].binaryDrawType;
      } else {
          return ;
      }
    },

    setPanelData: function(parentElement, data, key) {
      var elID = parentElement.attr('id'); 
      if (key == 'stringGeometry'){
         pointCloud.setStringGeometry(elID, data);  
      } else if (key == 'binaryGeometry') { 
        pointCloud.setBinaryGeometry(elID, data);
      } else if (key == 'status') { 
         divIDE.panelJSData[elID].status = data;
      } else if (key == 'binaryDrawType') {
         divIDE.panelJSData[elID].binaryDrawType = data;
      } else {
          return;
      }
    },

    init: function (elID){
        var showStats = false;

        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        panelContainer = $('#' + elID);

        var container;
        var camera, scene, renderer, material, i, h, color, sprite, size;
        var controls;
        var mouseX = 0, mouseY = 0;
        var pcPtRange = 0;
        var pcMaxRange = 0;
        var pcNextI = 0;

        var windowHalfX = panelContainer.width() / 2;
        var windowHalfY = panelContainer.height() / 2;

        // Initialize panelContainer
        container = document.createElement( 'div' );
        panelContainer.append( container );

        camera = new THREE.PerspectiveCamera( 55, panelContainer.width() / panelContainer.height(), 0.05, 200 );
        camera.position.z = 0;
        camera.position.x = 1;
        camera.position.y = 3;
        camera.up.set(0, 0, 1);

        //

        scene = new THREE.Scene();
//                 scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

//         geometry = new THREE.Geometry();

//                 sprite = new THREE.TextureLoader().load( "disc.png" );

//         var numPoints = pcMaxRange;
//         var positions = new Float32Array(numPoints*3);
//         var intensity = new Float32Array(numPoints);
//         var moments = new Float32Array(numPoints*3);

//         for(var i = 0; i < 10; i++){
//             positions[pcNextI*3 + 0] = Math.random();
//             positions[pcNextI*3 + 1] = Math.random()
//             positions[pcNextI*3 + 2] = Math.random()
//             intensities[pcNextI + 0] = Math.random()
//             moments[pcNextI*3 + 0] = Math.random()
//             moments[pcNextI*3 + 1] = Math.random()
//             moments[pcNextI*3 + 2] = Math.random()
//             pcNextI = pointCloud.incrementPcNextI(pcNextI, pcMaxRange);
//         }

//         geometry = new THREE.BufferGeometry();
//         geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
//         geometry.addAttribute("intensities", new THREE.BufferAttribute(intensities, 1));
//         geometry.addAttribute("moments", new THREE.BufferAttribute(moments, 3));
//         geometry.addAttribute("color", new THREE.BufferAttribute(moments, 3));

//         geometry.dynamic = true;
//         geometry.setDrawRange(0, 10);

        material = new THREE.PointsMaterial( { 
            size: 1,
            vertexColors: THREE.VertexColors,
            sizeAttenuation: true
//             alphaTest: 0.5, 
//             transparent: true, 
//             opacity: 0.9 
//                 	color: 0x555555,
// 	                map: sprite
         } );

//         particles = new THREE.Points( geometry, material );
//         scene.add( particles );

        //

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( panelContainer.width(), panelContainer.height() );
        container.appendChild( renderer.domElement );

        // 				

        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.addEventListener( 'change', pointCloud.render );

        //
        if (showStats) {
            var stats;
            stats = new Stats();
            container.appendChild( stats.dom );
        }

        //
        // BET THIS WON'T WORK, Need the equivalent for a div... 
        // THIS STILL DOESN"T WORK
        //panelContainer[0].addEventListener( 'resize', pointCloud.onWindowResize, false );
        window.addEventListener( 'resize', pointCloud.onWindowResize, false );
        // NEED TO CHANGE CUREL
        panelContainer.click(function (event) {
           var container = $(divIDE.getCtxTarget(event.target));
           pointCloud.curElID = container.attr('id'); 
        });
        renderer.domElement.addEventListener("dblclick", pointCloud.ondblclick, false);

        divIDE.panelJSData[elID] = {
            container: container,
            camera: camera, 
            scene: scene, 
            renderer: renderer, 
            material: material, 
            i: i, 
            h: h, 
            color: color, 
            sprite: sprite, 
            size: size, 
            controls: controls,
            mouseX: mouseX,
            mouseY: mouseY,
            pcPtRange: pcPtRange,
            pcMaxRange: pcMaxRange,
            pcNextI: pcNextI,
            windowHalfX: windowHalfX,
            windowHalfY: windowHalfY,
            status: 'ready',
            binaryDrawType: 'match'
        };

        if (showStats){
            divIDE.panelJSData[elID].stats = stats;
        };

        // Animate 
        pointCloud.curElID = elID;
        pointCloud.animate();
        pointCloud.onWindowResize();
    },

        
    incrementPcNextI: function (pcNextI, pcMaxRange){
        pcNextI += 1;
        if (pcNextI == pcMaxRange){
            pcNextI = 0;
        }
        return pcNextI;
    },

    onWindowResize: function () {
        var elID = pointCloud.curElID;
        var panelContainer = $('#' + elID);
                
        var windowHalfX = panelContainer.width() / 2;
        var windowHalfY = panelContainer.height() / 2;

        if (divIDE.panelJSData[elID].windowHalfX == windowHalfX &&
        divIDE.panelJSData[elID].windowHalfY == windowHalfY){
            return;
        }
        divIDE.panelJSData[elID].windowHalfX = windowHalfX;
        divIDE.panelJSData[elID].windowHalfY = windowHalfY;

        var camera = divIDE.panelJSData[elID].camera;
        var renderer = divIDE.panelJSData[elID].renderer;

        camera.aspect = panelContainer.width() / panelContainer.height();
        camera.updateProjectionMatrix();

        renderer.setSize( panelContainer.width(), panelContainer.height() );
    },

    // Functionality to change the focus point of the orbit controls
    ondblclick: function (event) {
        var elID = pointCloud.curElID;
        var panelContainer = $('#' + elID);
        var camera = divIDE.panelJSData[elID].camera;
        var controls = divIDE.panelJSData[elID].controls;
        var particles = divIDE.panelJSData[elID].binaryParticles;
        if (particles == undefined){
            particles = divIDE.panelJSData[elID].stringParticles;
        }
        if (particles == undefined){
            return;
        }

                
        x = ((event.clientX - panelContainer.offset().left) / panelContainer.innerWidth()) * 2 - 1;
        y = -((event.clientY - panelContainer.offset().top) / panelContainer.innerHeight()) * 2 + 1;
        dir = new THREE.Vector3(x, y, -1)
        dir.unproject(camera)

        ray = new THREE.Raycaster(camera.position, dir.sub(camera.position).normalize())
        var intersects = ray.intersectObject(particles);
        if ( intersects.length > 0 )
        {
            var minI = 0;
            var minD = intersects[0].distanceToRay;
            for (var i=0; i < intersects.length; i++){
                if (minD > intersects[i].distanceToRay){
                    minI = i;
                    minD = intersects[i].distanceToRay;
                }
            }
            controls.target.set(intersects[minI].point.x, intersects[minI].point.y, intersects[minI].point.z);
        }
    },    

    animate: function() {
        var elID = pointCloud.curElID;
        var controls = divIDE.panelJSData[elID].controls;
        var stats = divIDE.panelJSData[elID].stats;
        requestAnimationFrame( pointCloud.animate );
        controls.update()

        pointCloud.render(elID);
        if (stats !== undefined){
            stats.update();    
        }
    },

    render: function () {
        var elID = pointCloud.curElID;
        var scene = divIDE.panelJSData[elID].scene;
        var camera = divIDE.panelJSData[elID].camera;

        divIDE.panelJSData[elID].renderer.render( scene, camera );

        pointCloud.onWindowResize();
    },

    setStringGeometry: function (elID, vertices_json){
        divIDE.panelJSData[elID].status = 'busy';
        divIDE.onLinkDataChange($('#' + elID), 'status');
        try {
            var vertices = JSON.parse(vertices_json);
        } catch (e){
            return;
        }
        var scene = divIDE.panelJSData[elID].scene;
        var material = divIDE.panelJSData[elID].material;
        var geometry = divIDE.panelJSData[elID].stringGeometry;
        var color = [] ;

        if (geometry !== undefined){
            scene.remove(divIDE.panelJSData[elID].stringParticles);
            divIDE.panelJSData[elID].stringParticles.geometry.dispose();
        }

        geometry = new THREE.Geometry();
        var docolor = vertices[0].length;

        if ((docolor == 4) || (docolor == 3)){
            if (vmax == undefined){
                var vmax = -Infinity;
                for (var i = 0; i < vertices.length; i++){
                    if (vertices[i][docolor - 1] > vmax){
                        vmax = vertices[i][docolor - 1];
                    }
                }
            }
            if (vmin == undefined){
                var vmin = Infinity;
                for (var i = 0; i < vertices.length; i++){
                    if (vertices[i][docolor - 1] < vmin){
                        vmin = vertices[i][docolor -1];
                    }
                }
            }
            var colorMap = 'rainbow';
            var numberOfColors = 256;
            var lut = new THREE.Lut(colorMap, numberOfColors);
            lut.setMax ( vmax );
            lut.setMin ( vmin );
        }

        for (var i=0; i < vertices.length; i++){
            var vertex = new THREE.Vector3()
            vertex.x = vertices[i][0];
            vertex.y = vertices[i][1];
            vertex.z = vertices[i][2];
            geometry.vertices.push(vertex);
            if ((docolor == 4) || (docolor == 3))
            {
                var c = lut.getColor ( vertices[i][docolor - 1] );
                var col = new THREE.Color(c.r, c.g, c.b);
                geometry.colors.push(col);
            } else if (docolor == 6) {
                var col = new THREE.Color(vertices[i][3], 
                                          vertices[i][4],
                                          vertices[i][5]);
                geometry.colors.push(col);
            } 
        }
        var stringParticles = new THREE.Points( geometry, material );
        scene.add( stringParticles );
        divIDE.panelJSData[elID].stringParticles = stringParticles;
        divIDE.panelJSData[elID].stringGeometry = geometry;
        divIDE.panelJSData[elID].status = 'ready';
        divIDE.onLinkDataChange($('#' + elID), 'status');

    },

    // Functionality to set the color based on a colormap
    setPointColor: function(colorArray, array, arrayStride, arrayOffset, vmin, vmax){
        if (arrayStride == undefined){
            var arrayStride = 1;
        }
        if (arrayOffset == undefined){
            var arrayOffset = 0;
        }
        if (vmax == undefined){
            var vmax = -Infinity;
            for (var i = 0; i < array.length / arrayStride; i++){
                if (array[i*arrayStride + arrayOffset] > vmax){
                    vmax = array[i*arrayStride + arrayOffset];
                }
            }
        }
        if (vmin == undefined){
            var vmin = Infinity;
            for (var i = 0; i < array.length / arrayStride; i++){
                if (array[i*arrayStride + arrayOffset] < vmin){
                    vmin = array[i*arrayStride + arrayOffset];
                }
            }
        }
        var colorMap = 'rainbow';
        var numberOfColors = 256;
        var lut = new THREE.Lut(colorMap, numberOfColors);
        lut.setMax ( vmax );
        lut.setMin ( vmin );
        var c;
        for (var i = 0; i < array.length / arrayStride; i++){
            c = lut.getColor ( array[i*arrayStride + arrayOffset] )
            colorArray[i*3 + 0] = c.r;
            colorArray[i*3 + 1] = c.g;
            colorArray[i*3 + 2] = c.b;
        } 
    }, 

    updatePointCloudColors: function(geometry, attr, col, vmin, vmax){
        if (col == undefined){
            var col = 0;
        }
        pointCloud.setPointColor(
            geometry.attributes.color.array,
            geometry.attributes[attr].array,
            geometry.attributes[attr].itemSize, col, vmin, vmax);
        geometry.attributes.color.needsUpdate = true;			
    },

    setBinaryGeometry: function (elID, buffer){
        // This function assumes that the first row of data tells us about the
        // rest of the data. In particular, the first element of the array should
        // give the total number of columns in the data. 
        // The remaining data in that row is now being used
        // the buffer should contain only FLOAT32'scene
        // if buffer[0] == 3, set xyz points
        // if buffer[0] == 4, set xyz points and 'intensity'
        // if buffer[0] == 6, set xyzrgb

        divIDE.panelJSData[elID].status = 'busy';
        divIDE.onLinkDataChange($('#' + elID), 'status');

        container = $('#' + elID);
        var view = new DataView(buffer);

        // Figure out the size of the data
        var nColumns = view.getFloat32(0, true);
        var nBytes = 4;  // 4 bytes for a float32
        var stride = nColumns * nBytes;
        var numPoints = buffer.byteLength / stride - 1; // subtract 1 for first row

        // Figure out if we need to create a new geometry
        var geometry = divIDE.panelJSData[elID].binaryGeometry;
        
        // Figure out if geometry is big enough
        if ((geometry !== undefined) && (geometry.attributes.position.count < numPoints)){
            divIDE.panelJSData[elID].binaryParticles.dispose();
            divIDE.panelJSData[elID].binaryGeometry.dispose();
            geometry = undefined;
        }

        if (geometry === undefined){
           var pcSize = Math.max(numPoints, divIDE.panelJSData[elID].pcMaxRange);
           var position = new Float32Array(pcSize * 3);
           var color = new Float32Array(pcSize * 3);
           var intensity = new Float32Array(pcSize);

           geometry = new THREE.BufferGeometry(); 
           geometry.addAttribute("position", new THREE.BufferAttribute(position, 3));
           geometry.addAttribute("color", new THREE.BufferAttribute(color, 3));
           geometry.addAttribute("intensity", new THREE.BufferAttribute(intensity, 1));
           geometry.dynamic = true;
           divIDE.panelJSData[elID].binaryGeometry = geometry;
        }

        // Figure out how to adjust the draw range
        var pcNextI = divIDE.panelJSData[elID].pcNextI;
        var pcMaxRange = divIDE.panelJSData[elID].pcMaxRange;
        var pcPtRange = divIDE.panelJSData[elID].pcPtRange;
        if (divIDE.panelJSData[elID].binaryDrawType == 'fill'){
            pcPtRange += numPoints;
            pcPtRange = Math.min(pcPtRange, pcMaxRange);
        } else if (divIDE.panelJSData[elID].binaryDrawType == 'match') {
            pcNextI = 0;
            pcPtRange = numPoints;
        }
        divIDE.panelJSData[elID].pcPtRange = pcPtRange;

        geometry.setDrawRange(0, pcPtRange);

        var position = geometry.attributes.position.array
        var intensity = geometry.attributes.intensity.array
        var color = geometry.attributes.color.array

        for(var i = 1; i < numPoints + 1; i++){
            position[pcNextI*3 + 0] = view.getFloat32(i*stride + 0 * nBytes, true);
            position[pcNextI*3 + 1] = view.getFloat32(i*stride + 1 * nBytes, true);
            position[pcNextI*3 + 2] = view.getFloat32(i*stride + 2 * nBytes, true);
            if (nColumns == 4){
                intensity[pcNextI + 0] = view.getFloat32(i*stride + 3 * nBytes, true);    
            } else if (nColumns == 6){
                color[pcNextI*3 + 0] = view.getFloat32(i*stride + 3 * nBytes, true);
                color[pcNextI*3 + 1] = view.getFloat32(i*stride + 4 * nBytes, true);
                color[pcNextI*3 + 2] = view.getFloat32(i*stride + 5 * nBytes, true);
            }            
            pcNextI = pointCloud.incrementPcNextI(pcNextI, pcMaxRange);
        }
        divIDE.panelJSData[elID].pcNextI = pcNextI;
        
        if (nColumns == 3){
            pointCloud.updatePointCloudColors(geometry, 'position', 2);    
        } else if (nColumns == 4){
            pointCloud.updatePointCloudColors(geometry, 'intensity', 0);    
        } else if (nColumns == 6){
            geometry.attributes.color.needsUpdate = true;			
        }
        geometry.attributes.position.needsUpdate = true;			


        // try to free some of this memory
        buffer = null;
        view = null;

        // In case this is the first time
        var particles = divIDE.panelJSData[elID].binaryParticles;
        if (particles === undefined){
           var material = divIDE.panelJSData[elID].material;
           particles = new THREE.Points( geometry, material );
           divIDE.panelJSData[elID].binaryParticles = particles;
           divIDE.panelJSData[elID].scene.add( particles );
        }

        // Let everyone know I'm ready to receive more data
        divIDE.panelJSData[elID].status = 'ready';
        divIDE.onLinkDataChange($('#' + elID), 'status');
    }
}

divIDE.registerPanel(pointCloud);
