// var serverUrl = "https://itpenertivserver.herokuapp.com";
// var serverUrl = 'https://agile-reef-71741.herokuapp.com';
var serverUrl = "http://0.0.0.0:5000";


var schema ;
var startTime;
var timeRange;
var mainLineGraphY;


$(document).ready(function(){
  console.log("document is ready");
  //Login and get authenticated
  setupInputSliderButton();
  var noOfHours = 24 -parseInt($('.input-slider')[0].value);
  makeAjaxCallToGetSchema(noOfHours);

  $(".dial").knob({
    'min':0,
    'max':23,
    'fgColor':'#ff0000'
});

})


//Three.js
//set scene
var scene = new THREE.Scene();

var SCREEN_WIDTH = window.innerWidth*0.7, SCREEN_HEIGHT = window.innerHeight*0.8;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 20000;


//set camera
var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
scene.add(camera);
camera.position.set(100,-1700,1500);
camera.lookAt(scene.position);

//set renderer
var renderer = new THREE.WebGLRenderer( {antialias:true} );
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
document.body.appendChild(renderer.domElement);


//set events
THREEx.WindowResize(renderer, camera); // automatically resize renderer
THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) }); // toggle full-screen on given key press

var render = function() {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
  renderer.setSize(window.innerWidth*0.7 - 20, window.innerHeight*0.8 - 20);
  renderer.setClearColor(0xffffff);
};

console.log("*****************MATHURA***************");
console.log(render);

//set controls (using lib - OrbitControls.js)
var controls;
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render )

// create a light
var light = new THREE.PointLight(0x000000);
light.position.set(500,-10,120);
scene.add(light);

var light = new THREE.PointLight(0x0000FF);
light.position.set(100,-100,0);
scene.add(light);

// var light = new THREE.PointLight(0x00FFFF);
// light.position.set(-100,-10,1000);
// scene.add(light);

// var ambientLight = new THREE.AmbientLight(0x111111);
// scene.add(ambientLight);



function makeAjaxCallToGetSchema(timeRange)
{
  var now = new Date();
  startTime = now - timeRange*60000*60 ;// temp hack for EST. Conert to moment js - 4*60000*60
  startTime = new Date(startTime);
  startTime = startTime.toISOString();
  startTime = startTime.slice(0,-5);

  $.ajax({
    url: serverUrl + '/login?loginId=horsetrunk12',
    success: function(result){
      console.log('result from the server -- ' + result);
      console.log('LOGGED IN');

    }
  }).done(function(){

    $.ajax({
      url: serverUrl + '/schema_itp',
      success: function(result){
        schema = JSON.parse(result);
        console.log(schema);
      }
    }).done(function(){
      console.log('SO DONE');
      var subLocationArray = '';
      var outputData = '';
      for(var i =0;i<schema.length;i++)
      {
        console.log(schema[i].id + ' -- ' + schema[i].name );
        subLocationArray = subLocationArray.concat(schema[i].id);
        if(i!=schema.length-1){
          subLocationArray = subLocationArray.concat(',');
        }
      }
      console.log(subLocationArray);
      $.ajax({
        url: serverUrl + '/floordata_itp?startTime=' + startTime + '&sublocationId=' + subLocationArray,
        success: function(result){
          console.log('going to parse data');
          subLocationData = result;

          // data is ready, show the graph
          showGraph(subLocationData);
          //console.log(subLocationData);
          showMostUsedEquipmentLast5Hours();

        }
      }).done(function(){
        console.log('data parsed');
        var energyKey;
        var energyValue;
        console.log(subLocationData.length);
        $('.floorData').empty();
        $('.roomData').empty();
        $('#visualisation').empty();
        for(var i =0;i<subLocationData.length;i++){
          if(true)//subLocationData[i].data.names[0] && subLocationData[i].totalEnergy)
          {
            if(subLocationData[i].id.localeCompare('cb4d8d3f-c476-4216-9292-43d45610c027')==0)
            {
              mainLineGraphY = showFloorGraph(subLocationData[i]);
            }
            //add the line graph in the bottom - cb4d8d3f-c476-4216-9292-43d45610c027



            energyKey = $('<div>');
            //console.log('making the shizz');
            energyKey.attr('class','energy-key-name');
            energyKey.attr('id',subLocationData[i].id);
            energyKey.html(subLocationData[i].data.names[0]);
            energyKey.data('room-id',subLocationData[i].id);
            $('.floorData').append(energyKey);
            // energyKey.data('id',subLocationData[i].id);
            energyValue = $('<div>');
            energyValue.attr('class','energy-value');
            energyValue.html((subLocationData[i].totalEnergy*1000).toFixed(2)+ ' W' );
            $('.floorData').append(energyValue);

            energyKey.click(function(){
              console.log(this);
              console.log(this.id);
              getRoomData(this.id);
              $('.itp-floor-line-graph').remove();
              $('.room-data-section').fadeIn(500);
              $('.floor-data-section').fadeOut(500);
              $('.three-model-container').fadeOut(500);
              $('.input-slider-container').fadeOut(500);
            })
          }
        }
      })
    });
  });
}


var cubes;

function showGraph(subLocationData) {
  var range = 10;
  cubes = new THREE.Object3D();
  scene.add( cubes );

  //find the room with maximum energy usage on the floor
  var maxEnergy  = 0;

  for(var i = 0; i < rooms.length; i++ ) {
    var tempEnergy = 0;
    for(var j =0;j<rooms[i].sublocationId.length;j++){
      tempEnergy += getEnergyForSubLocation(rooms[i].sublocationId[j]);
    }
    if(tempEnergy>maxEnergy){
      maxEnergy = tempEnergy;
    }
  }

  scene.add( new THREE.AxisHelper( maxEnergy*10 ) );

  var gridHelper = new THREE.GridHelper( 500, 20 );
  gridHelper.rotation.set(0,3.14/2,3.14/2);
  scene.add( gridHelper );

  for(var i = 0; i < rooms.length; i++ ) {

    var tempTotalEnergy = 0;
    for(var j =0;j<rooms[i].sublocationId.length;j++){
      tempTotalEnergy += getEnergyForSubLocation(rooms[i].sublocationId[j]);
    }
    if(tempTotalEnergy == 0) {
      tempTotalEnergy = 0.0002;
    }

    var texture = [];
    // material texture
    for(var m =0;m<4;m++){
      texture[m] = new THREE.Texture( generateTexture(tempTotalEnergy,maxEnergy)[m] );
      texture[m].needsUpdate = true;
    }


    var ratio = tempTotalEnergy/maxEnergy;
    console.log('the ratio measured is -- ' + ratio);
    var test = 80*ratio;
    var topColor = 'hsl('+280+test+', 100%, 50%)';



    var geom = new THREE.CubeGeometry( rooms[i].w, rooms[i].l, tempTotalEnergy*10  );
    var grayness = Math.random() * 0.5 + 0.25;
    var cubeMaterials = [
      new THREE.MeshBasicMaterial({ map: texture[1], transparent: true }),//right wall SET
      new THREE.MeshBasicMaterial({ map: texture[3], transparent: true }),//left wall
      new THREE.MeshBasicMaterial({ map: texture[2], transparent: true }),//back wall SET
      new THREE.MeshBasicMaterial({ map: texture[0], transparent: true }),//front wall SET
      new THREE.MeshBasicMaterial({ color:topColor, transparent: true }),
      new THREE.MeshBasicMaterial({ map: texture[0], transparent: true }),
    ];
    var mat = new THREE.MeshFaceMaterial( cubeMaterials );
    var cube = new THREE.Mesh( geom, mat );

    scene.add(cube);
    cube.position.set(rooms[i].xpos, rooms[i].ypos-250, tempTotalEnergy*5); // change the center of 'z' to the base
    cube.rotation.set( 0, 0, 0);
    cube.grayness = grayness; // *** NOTE THIS
    cube.userData = {
               id: rooms[i].sublocationId,
               name: rooms[i].name
           };
    cubes.add( cube );

  }
}

function getEnergyForSubLocation(id)
{
  for(var i=0;i<subLocationData.length;i++)
  {
    if(subLocationData[i].id.localeCompare(id)==0){
      return subLocationData[i].totalEnergy;
    }
    else
    {
      continue;
    }
  }
}

var mouseVector = new THREE.Vector3();
var raycaster = new THREE.Raycaster();

window.addEventListener( 'mousemove', onMouseMove, false );
$('canvas').wrap("<div class='three-model-container'></div>");
// $('canvas').on( 'mousemove', onMouseMove, false );
// window.addEventListener( 'click', onMouseClick, false );

function onMouseMove(e)
{
  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );
  // console.log(e.clientX);

  raycaster.setFromCamera( mouseVector.clone(), camera );
  var intersects = raycaster.intersectObjects( cubes.children );
  // cubes.children.forEach(function( cube ) {
  //   cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
  // });

  for( var i = 0; i < intersects.length; i++ ) {
    var intersection = intersects[ i ],
    obj = intersection.object;
    // obj.material.color.setRGB( 1.0 - i / intersects.length, 0, 0 );


  }
  $('.hover-room').html(intersects[0].object.userData.name);
}

function onMouseClick(e){
  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );
  //console.log(e.clientX);

  raycaster.setFromCamera( mouseVector.clone(), camera );
  var intersects = raycaster.intersectObjects( cubes.children );
  // cubes.children.forEach(function( cube ) {
  //   cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
  // });
  getRoomsData(intersects[0].object.userData.id);

  var roomData = [];
  var roomDataYAxis = [];

  //add another graph in the bottom line graph which is the room data
  //go through the sublocation data that mapped the floor graph
  for(var i =0;i<subLocationData.length;i++){
    //compare with the space you clicked
    for(var j=0;j<intersects[0].object.userData.id.length;j++){
      if(subLocationData[i].id.localeCompare(intersects[0].object.userData.id[j])==0)
      {
        console.log('matches');
        for(var k=0;k<subLocationData[i].data.data.length;k++){
          var temp;

          if(Object.keys(subLocationData[i].data.data[0])[1].localeCompare('x')){
            temp = subLocationData[i].data.data[k][Object.keys(subLocationData[i].data.data[0])[1]];
          }
          else
          {
            temp = subLocationData[i].data.data[k][Object.keys(subLocationData[i].data.data[0])[0]];
          }

          if(roomDataYAxis[k]){
            roomDataYAxis[k] += temp;
          }
          else{
            roomDataYAxis[k] = temp;
          }

          roomData[k] = {"x":subLocationData[i].data.data[k].x,
                          "y":roomDataYAxis[k]};
        }
      }
    }
  }

  appendRoomLineGraph(roomData)
}


function getRoomsData(subLocationIdList)
{
  // console.log('fetching data for -- ' + roomId[0]);
  var equipmentList = '';
  for(var a =0 ;a<subLocationIdList.length;a++){
    for(var i=0;i<schema.length;i++)
    {
      if(schema[i].id.localeCompare(subLocationIdList[a]) == 0)
      {
        console.log('the room is -- ' + schema[i].name);
        for(var j =0;j<schema[i].equipments.length;j++)
        {
          equipmentList = equipmentList.concat(schema[i].equipments[j]);
          if(true){//j!=schema[i].equipments.length-1){
              equipmentList = equipmentList.concat(',');
          }
        }
      }
    }
  }
  console.log(equipmentList);
   equipmentList=equipmentList.slice(0,-1);
   console.log(equipmentList);
  $.ajax({
    url: serverUrl + '/floordata_itp?startTime=' + startTime + '&equipmentId=' + equipmentList,
    success: function(result){
      console.log('going to parse data');
      console.log(result);
      equipmentData = result;
    }
  }).done(function(){
    $('.room-data-section').fadeIn(500);
    $('.floor-data-section').fadeOut(500);
    $('.three-model-container').fadeOut(500);
    $('.input-slider-container').fadeOut(500);
    var energyKey;
    var energyValue;
    $('.roomData').empty();
    $('#visualisation').empty();

    plotLineGraph(equipmentData);
    drawTreeMap(equipmentData);

//    drawCircles(equipmentData);

  })
  return;

}


var animate = function(){
  requestAnimationFrame( animate );
  controls.update();
};

function generateTexture(roomEnergy,maxEnergy) {

	var size = 52;

  var canvasArray = [];
  for(var i =0;i<4;i++){

  	// create canvas
  	canvas = document.createElement( 'canvas' );
  	canvas.width = size;
  	canvas.height = size;

  	// get context
  	var context = canvas.getContext( '2d' );

  	// draw gradient
  	context.rect( 0, 0, size, size );
    var gradient;
    switch(i){
      case 0:
        gradient = context.createLinearGradient( size, size, size, 0);
        break;
      case 1:
        gradient = context.createLinearGradient( size, size, 0, size);
        break;
      case 2:
        gradient = context.createLinearGradient( size, 0, size, size);
        break;
      case 3:
        gradient = context.createLinearGradient( 0, size, size, size);
        break;
    }

    var ratio = roomEnergy/maxEnergy;
    var test = 80*(ratio);
    gradient.addColorStop(0,  'hsl(280, 100%, '+ (i%2 + 1)*20 + '%)'); // purple
    gradient.addColorStop(1,  'hsl('+280+test+', 100%, '+ (i%2 + 1)*20 + '%)'); // gradient colour

  	context.fillStyle = gradient;
  	context.fill();
    canvasArray.push(canvas);
  }

	return canvasArray;

}


//display most used Equipment in the last 5 hours
function showMostUsedEquipmentLast5Hours() {
  // var mostUsedEquipmentLast5Hours = d3.select("#embed-most-used-equipment-image").append("img")
  //     .attr("src","http://upload.wikimedia.org/wikipedia/commons/b/b0/NewTux.svg")
  //     .attr("width", 200)
  //     .attr("height", 200)
}





render();
animate();
