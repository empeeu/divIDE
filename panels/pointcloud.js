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
        'xyz',
        'c', 
        'rgb',
        'xyzc',
        'xyzrgb'
    ],

    getPanelData: function(parentElement, key){
      if (key == 'xyz'){
         return;  
      } else if (key == 'c') { 
         return;
      } else if (key == 'rgb') { 
         return;
      } else if (key == 'xyzc') { 
         return;
      } else if (key == 'xyzrgb') { 
         return;
      } else {
          return;
      }
    },

    setPanelData: function(parentElement, data, key) {
      if (key == 'xyz'){
         return;  
      } else if (key == 'c') { 
         return;
      } else if (key == 'rgb') { 
         return;
      } else if (key == 'xyzc') { 
         return;
      } else if (key == 'xyzrgb') { 
         return;
      } else {
          return;
      }
    },

    init: function (elID){
        var showStats = true;

        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        panelContainer = $('#' + elID);

        var container;
        var camera, scene, renderer, particles, geometry, material, i, h, color, sprite, size;
        var controls;
        var mouseX = 0, mouseY = 0;
        var pcPtRange = 10;
        var pcMaxRange = 64*64;
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

        geometry = new THREE.Geometry();

//                 sprite = new THREE.TextureLoader().load( "disc.png" );

        var numPoints = pcMaxRange;
        var positions = new Float32Array(numPoints*3);
        var intensities = new Float32Array(numPoints);
        var moments = new Float32Array(numPoints*3);

        for(var i = 0; i < 10; i++){
            positions[pcNextI*3 + 0] = Math.random();
            positions[pcNextI*3 + 1] = Math.random()
            positions[pcNextI*3 + 2] = Math.random()
            intensities[pcNextI + 0] = Math.random()
            moments[pcNextI*3 + 0] = Math.random()
            moments[pcNextI*3 + 1] = Math.random()
            moments[pcNextI*3 + 2] = Math.random()
            pcNextI = pointCloud.incrementPcNextI(pcNextI, pcMaxRange);
        }

        geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute("intensities", new THREE.BufferAttribute(intensities, 1));
        geometry.addAttribute("moments", new THREE.BufferAttribute(moments, 3));
        geometry.addAttribute("color", new THREE.BufferAttribute(moments, 3));

        geometry.dynamic = true;
        geometry.setDrawRange(0, 10);

        material = new THREE.PointsMaterial( { 
            size: 0.02,
            vertexColors: THREE.VertexColors,
            sizeAttenuation: true, 
            alphaTest: 0.5, 
            transparent: true, 
            opacity: 0.9 
//                 	color: 0x555555,
// 	                map: sprite
         } );

        particles = new THREE.Points( geometry, material );
        scene.add( particles );

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
        panelContainer[0].addEventListener( 'resize', pointCloud.onWindowResize, false );
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
            particles: particles, 
            geometry: geometry, 
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

//                 controls.handleResize();

//         pointCloud.render();

    },

    animate: function() {
        var elID = pointCloud.curElID;
        var controls = divIDE.panelJSData[elID].controls;
        var stats = divIDE.panelJSData[elID].stats;
        requestAnimationFrame( pointCloud.animate );
        controls.update()

        pointCloud.render(elID);
        stats.update();

    },

    render: function () {
        var elID = pointCloud.curElID;
        var scene = divIDE.panelJSData[elID].scene;
        var camera = divIDE.panelJSData[elID].camera;

        divIDE.panelJSData[elID].renderer.render( scene, camera );

        pointCloud.onWindowResize();
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
        setPointColor(
            geometry.attributes.color.array,
            geometry.attributes[attr].array,
            geometry.attributes[attr].itemSize, col, vmin, vmax);
        geometry.attributes.color.needsUpdate = true;			
    },
      
    // Functionality to change the focus point of the orbit controls
    ondblclick: function (event) {
        var elID = pointCloud.curElID;
        var panelContainer = $('#' + elID);
        var camera = divIDE.panelJSData[elID].camera;
        var controls = divIDE.panelJSData[elID].controls;
        var particles = divIDE.panelJSData[elID].particles;
                
        x = ((event.clientX - panelContainer.offset().left) / panelContainer.width()) * 2 - 1;
        y = -((event.clientY - panelContainer.offset().top) / panelContainer.height()) * 2 + 1;
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

    streamData: function () {
        ws.send('sendData');
        wsStreaming = true;
    },

    stopStreamData: function (){
        wsStreaming = false;
    },

    updatePointCloud: function (buffer, elID){
        container = $('#' + elID);
        var pcNextI = divIDE.panelJSData[container].pcNextI;
        var pcMaxRange = divIDE.panelJSData[container].pcMaxRange;
        var n_columns = 7;
        var n_bytes = 4;  // astype np.float32 on server side
        var stride = n_columns * n_bytes;
        var view = new DataView(buffer);
        var numPoints = buffer.byteLength / stride;
        pcPtRange += numPoints;
        pcPtRange = Math.min(pcPtRange, pcMaxRange);

        var position = geometry.attributes.position.array
        var intensities = geometry.attributes.intensities.array
        var moments = geometry.attributes.moments.array

        for(var i = 0; i < numPoints; i++){
            position[pcNextI*3 + 0] = view.getFloat32(i*stride + 0 * n_bytes, true);
            position[pcNextI*3 + 1] = view.getFloat32(i*stride + 1 * n_bytes, true);
            position[pcNextI*3 + 2] = view.getFloat32(i*stride + 2 * n_bytes, true);
            intensities[pcNextI + 0] = view.getFloat32(i*stride + 3 * n_bytes, true);
            moments[pcNextI*3 + 0] = view.getFloat32(i*stride + 4 * n_bytes, true);
            moments[pcNextI*3 + 1] = view.getFloat32(i*stride + 5 * n_bytes, true);
            moments[pcNextI*3 + 2] = view.getFloat32(i*stride + 6 * n_bytes, true);
            pointCloud.incrementPcNextI(pcNextI, pcMaxRange)
        }
        updatePointCloudColors(geometry, 'position', 2);
        geometry.attributes.position.needsUpdate = true;			
        geometry.setDrawRange(0, pcPtRange);

        // try to free some of this memory
        buffer = null;
        view = null;

        // Ask for the next set of data
        if (wsStreaming){
            ws.send('sendData');
// 					setTimeout(ws.send('stream'), 1000);	
        }

    }
}

divIDE.registerPanel(pointCloud);
