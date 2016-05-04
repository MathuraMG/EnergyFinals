
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
  // RENDER //
  //////////////
  var render = function() {
      requestAnimationFrame( render );
      renderer.render(scene, camera);
      renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
  };

  //////////////
	// CONTROLS //
	//////////////
	// move mouse and: left   click to rotate,
	//                 middle click to zoom,
	//                 right  click to pan

  var controls;
    controls = new THREE.OrbitControls( camera,renderer.domElement );
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

  cubes = new THREE.Object3D();
  scene.add( cubes );

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
            //scene.add(cube);
    // mat.color.setRGB(Math.random(0,255),Math.random(0,255),150);
        cube.position.set(rooms[i].xpos, rooms[i].ypos, i*5 );
        //cube.position.set( range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) );
        cube.rotation.set( 0, 0, 0);
        cube.grayness = grayness; // *** NOTE THIS
        cube.userData = {
                   id: i
               };
        cubes.add( cube );
        console.log(cube);
        console.log(cubes);

 }



  // var projector = new THREE.Projector();
  var mouseVector = new THREE.Vector3();
  var raycaster = new THREE.Raycaster();

  window.addEventListener( 'mousemove', onMouseMove, false );

  function onMouseMove(e)
  {
    mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );
    console.log(e.clientX);

    // var raycaster = projector.pickingRay( mouseVector.clone(), camera );
    raycaster.setFromCamera( mouseVector.clone(), camera );
    var intersects = raycaster.intersectObjects( cubes.children );
    cubes.children.forEach(function( cube ) {
      cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
    });

    for( var i = 0; i < intersects.length; i++ ) {
      var intersection = intersects[ i ],
      obj = intersection.object;
      obj.material.color.setRGB( 1.0 - i / intersects.length, 0, 0 );
      console.log('intersects -- ' + i);
    }
    // console.log(intersects[0].object.userData.id);


  }

  var animate = function(){
  requestAnimationFrame( animate );
  controls.update();
  };


render();
animate();


//}());
