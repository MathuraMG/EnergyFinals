
  var scene = new THREE.Scene();
  //console.log(schema);
	////////////
	// CAMERA //
	////////////

	// set the view size in pixels (custom or according to window size)
	// var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	// camera attributes
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	// set up camera
	var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	// add the camera to the scene
	scene.add(camera);
	// the camera defaults to position (0,0,0)
	// 	so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
	camera.position.set(100,-1700,1500);
	camera.lookAt(scene.position);


  //////////////
  // RENDERER //
  //////////////
  var renderer = new THREE.WebGLRenderer( {antialias:true} );
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);


  ////////////
  // EVENTS //
  ////////////
  // automatically resize renderer
  THREEx.WindowResize(renderer, camera);
  // toggle full-screen on given key press
  THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });


  //////////////
	// CONTROLS //
	//////////////
	// move mouse and: left   click to rotate,
	//                 middle click to zoom,
	//                 right  click to pan

  var controls;
    controls = new THREE.OrbitControls( camera );
    controls.addEventListener( 'change', render );
	//var controls = new THREE.OrbitControls( camera, renderer.domElement );


  ///////////
	// LIGHT //
	///////////
	// create a light
	var light = new THREE.PointLight(0xFFFF00);
	light.position.set(500,-10,120);
	scene.add(light);

  var light = new THREE.PointLight(0x0000FF);
	light.position.set(100,-100,0);
	scene.add(light);

  var light = new THREE.PointLight(0x00FFFF);
	light.position.set(-100,-10,1000);
	scene.add(light);

	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);



  ////////////
  ///ROOMS///
  ///////////

  var range = 10;

     for(var i = 0; i < rooms.length; i++ ) {
       console.log(rooms[i]);

        var geom = new THREE.CubeGeometry( rooms[i].w, rooms[i].l, i*10  );

             var grayness = Math.random() * 0.5 + 0.25,
                     mat = new THREE.MeshLambertMaterial(
                       {
                         color: 0xffffff
                       }
                     ),
                     cube = new THREE.Mesh( geom, mat );
                    scene.add(cube);
            // mat.color.setRGB(Math.random(0,255),Math.random(0,255),150);
             cube.position.set(rooms[i].xpos, rooms[i].ypos, i*5 );
             //cube.position.set( range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) );
             cube.rotation.set( 0, 0, 0);
             cube.grayness = grayness; // *** NOTE THIS
            //  cubes.add( cube );

     }


  //  var cube = new THREE.Mesh(geometry, material);
  //  scene.add(cube);
  //   cube.rotation.x += 50;
  //   cube.rotation.y += 50;
  //   cube.rotation.z -= 5;
   //


    // camera.position.x =  200;
    // camera.position.z =  600;
    // camera.position.y =  -800;
    //
    // camera.rotation.x =  0.985 ;
    // camera.rotation.y = 0.3 ;
    // camera.rotation.z = 0 ;



   var render = function() {
       requestAnimationFrame( render );
       renderer.render(scene, camera);
       renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
   };


  var animate = function(){
    requestAnimationFrame( animate );
    controls.update();
  };


render();
animate();


//}());
