// var serverUrl = "https://itpenertivserver.herokuapp.com";
// var serverUrl = 'https://agile-reef-71741.herokuapp.com';
var serverUrl = "http://0.0.0.0:5000";


var schema ;
var startTime;
var timeRange;
var mainLineGraphY;

//Three JS variables
var scene;
var camera;
var renderer;
var SCREEN_WIDTH = window.innerWidth*0.7, SCREEN_HEIGHT = window.innerHeight*0.8;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 20000;

//Three.js
//set scene
var scene = new THREE.Scene();

//set camera
var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
scene.add(camera);
camera.position.set(100*.52,-1700*.52,1500*.52);
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
  renderer.setClearColor(0xfff3e6);
};

//set controls (using lib - OrbitControls.js)
var controls;
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render )

$(document).ready(function(){
  //Login and get authenticated
  setupInputSliderButton();
  var noOfHours = 24 -parseInt($('.input-slider')[0].value);
  makeAjaxCallToGetSchema(noOfHours);

  $(".dial").knob({
    'min':0,
    'max':23,
    'fgColor':'#FF6666',
    'lineCap':'round',
    'width':'100',
    'height':'100',
    'thickness':'.5',
    'bgColor':'#fFE6CC'
  });

})

function makeAjaxCallToGetSchema(timeRange) {
  var now = new Date();
  startTime = now - timeRange*60000*60 ;// temp hack for EST. Conert to moment js - 4*60000*60
  startTime = new Date(startTime);
  startTime = startTime.toISOString();
  startTime = startTime.slice(0,-5);

  $.ajax({
    url: serverUrl + '/login?loginId=horsetrunk12',
    success: function(result){
      console.log('LOGGED IN');

    }
  }).done(function(){

    $.ajax({
      url: serverUrl + '/schema_itp',
      success: function(result){
        schema = JSON.parse(result);
      }
    }).done(function(){
      var subLocationArray = '';
      var outputData = '';
      for(var i =0;i<schema.length;i++)
      {
        subLocationArray = subLocationArray.concat(schema[i].id);
        if(i!=schema.length-1){
          subLocationArray = subLocationArray.concat(',');
        }
      }
      $.ajax({
        url: serverUrl + '/floordata_itp?startTime=' + startTime + '&sublocationId=' + subLocationArray,
        success: function(result){
          subLocationData = result;

          // data is ready, show the graph
          showGraph(subLocationData);
          showMostUsedEquipmentLast5Hours();

        }
      }).done(function(){
        console.log('data parsed');
        var energyKey;
        var energyValue;
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

  var axis = new THREE.AxisHelper( 2000 )
  axis.position.set(-500,0,0);
  //scene.add( axis );


  var gridHelper = new THREE.GridHelper( 1000, 25 );
  gridHelper.rotation.set(0,3.14/2,3.14/2);
  gridHelper.position.set(0,0,-5);
  gridHelper.setColors ("#FFE6CC", "#FFE6CC")
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
    var test = 90*ratio;
  var topColor = 'hsl('+(90-test)+', 100%, 50%)';



    var geom = new THREE.CubeGeometry( rooms[i].w, rooms[i].l, tempTotalEnergy*50  );
    var grayness = Math.random() * 0.5 + 0.25;
    var cubeMaterials = [
      new THREE.MeshBasicMaterial({ map: texture[1], transparent: true }),//right wall SET
      new THREE.MeshBasicMaterial({ map: texture[3], transparent: true }),//left wall
      new THREE.MeshBasicMaterial({ map: texture[2], transparent: true }),//back wall SET
      new THREE.MeshBasicMaterial({ map: texture[0], transparent: true }),//front wall SET
      new THREE.MeshBasicMaterial({ color:topColor, transparent: true }),
      new THREE.MeshBasicMaterial({ color:topColor, transparent: true }),
    ];
    var mat = new THREE.MeshFaceMaterial( cubeMaterials );
    var cube = new THREE.Mesh( geom, mat );

    scene.add(cube);
    cube.position.set(rooms[i].xpos, rooms[i].ypos-350, tempTotalEnergy*25); // change the center of 'z' to the base
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

$('canvas').wrap("<div class='three-model-container'></div>");
var modelContainer = document.getElementsByClassName('three-model-container')[0];

modelContainer.addEventListener( 'mousemove', onMouseMove, false );

modelContainer.addEventListener( 'click', onMouseClick, false );

function onMouseMove(e)
{
  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );

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
  if(intersects[0]){
    $('#mouse-label').css('display','block');
    $('#mouse-label').html(intersects[0].object.userData.name);
    $('#mouse-label').css('top',e.clientY);
    $('#mouse-label').css('left',e.clientX+10);
    console.log(intersects[0].object.userData.name);
  }
  else {
    $('#mouse-label').css('display','none');
  }

}

function onMouseClick(e){
  console.log('clicketh');
  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );

  raycaster.setFromCamera( mouseVector.clone(), camera );
  var intersects = raycaster.intersectObjects( cubes.children );
  // cubes.children.forEach(function( cube ) {
  //   cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
  // });
  getRoomsData(intersects[0].object.userData.id);
  $('.line-graph-index-name#room').html(intersects[0].object.userData.name);
  $('.line-graph-index-box#room').removeClass('empty-index-box');

  var roomData = [];
  var roomDataYAxis = [];

  //add another graph in the bottom line graph which is the room data
  //go through the sublocation data that mapped the floor graph
  for(var i =0;i<subLocationData.length;i++){
    //compare with the space you clicked
    for(var j=0;j<intersects[0].object.userData.id.length;j++){
      if(subLocationData[i].id.localeCompare(intersects[0].object.userData.id[j])==0)
      {
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
  var equipmentList = '';
  for(var a =0 ;a<subLocationIdList.length;a++){
    for(var i=0;i<schema.length;i++)
    {
      if(schema[i].id.localeCompare(subLocationIdList[a]) == 0)
      {
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
   equipmentList=equipmentList.slice(0,-1);
  $.ajax({
    url: serverUrl + '/floordata_itp?startTime=' + startTime + '&equipmentId=' + equipmentList,
    success: function(result){
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

    equipmentData = sortData(equipmentData);
    plotLineGraph(equipmentData);
    drawTreeMap(equipmentData);
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
    var ratio = roomEnergy/maxEnergy;
    var test = 90*(ratio);

    switch(i){
      case 0:
        gradient = context.createLinearGradient( size, size, size, 0);
        gradient.addColorStop(0,  'hsl(90, 70%, 40%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 70%, 40%'); // gradient colour
        break;
      case 1:
        gradient = context.createLinearGradient( size, size, 0, size);
        gradient.addColorStop(0,  'hsl(90, 70%, 40%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 70%, 40%'); // gradient colour
        break;
      case 2:
        gradient = context.createLinearGradient( size, 0, size, size);
        gradient.addColorStop(0,  'hsl(90, 100%, 70%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 100%, 70%'); // gradient colour
        break;
      case 3:
        gradient = context.createLinearGradient( 0, size, size, size);
        gradient.addColorStop(0,  'hsl(90, 100%, 50%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 100%, 70%'); // gradient colour
        break;
    }

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
