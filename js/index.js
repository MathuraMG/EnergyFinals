var serverUrl = "https://itpenertivserver.herokuapp.com";
// var serverUrl = "http://0.0.0.0:5000";

var schema ;
var startTime;
var timeRange;


$(document).ready(function(){
  console.log("document is ready");
  //Login and get authenticated
  setupInputSliderButton();
  //timeRange = parseInt($('.input-slider')[0].value);
  //makeAjaxCallToGetSchema(timeRange);
})


//Three.js
//set scene
var scene = new THREE.Scene();
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;


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


//set controls (using lib - OrbitControls.js)
var controls;
  controls = new THREE.OrbitControls( camera );
  controls.addEventListener( 'change', render );
//var controls = new THREE.OrbitControls( camera, renderer.domElement );


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








function makeAjaxCallToGetSchema(timeRange)
{
  var now = new Date();
  startTime = now - timeRange*60000*60 - 4*60000*60 ;// temp hack for EST. Conert to moment js
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
        //console.log("lallaa" + schema[i].id + ' -- ' + schema[i].name );
        subLocationArray = subLocationArray.concat(schema[i].id);
        if(i!=schema.length-1){
          subLocationArray = subLocationArray.concat(',');
        }

      //  subLocationArray = subLocationArray.slice(0, -1);
        //subLocationArray = subLocationArray.substring(0,subLocationArray.length-2);
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
        }
      }).done(function(){
        console.log('data parsed');
        var energyKey;
        var energyValue;
        console.log(subLocationData.length);
        $('.floorData').empty();
        $('.roomData').empty();
        for(var i =0;i<subLocationData.length;i++){
          if(subLocationData[i].data.names[0] && subLocationData[i].totalEnergy)
          {
            //console.log(subLocationData[i].data.names[0] + ' -- ' + subLocationData[i].totalEnergy );
            energyKey = $('<div>');
            console.log('making the shizz');
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
              // console.log(this.dataset.dataRoomId);
            })
          }

        }

      })

    });
  });

}




function getRoomData(roomId)
{
  console.log('fetching data for -- ' + roomId);
  for(var i=0;i<schema.length;i++)
  {
    var equipmentList = '';
    // console.log('compare : ' + schema[i].id + ' -- ' + roomId);
    if(schema[i].id.localeCompare(roomId) == 0)
    {
      console.log('the room is -- ' + schema[i].name);
      for(var j =0;j<schema[i].equipments.length;j++)
      {
        equipmentList = equipmentList.concat(schema[i].equipments[j]);
        if(j!=schema[i].equipments.length-1){
            equipmentList = equipmentList.concat(',');
        }
      }
      $.ajax({
        url: serverUrl + '/floordata_itp?startTime=' + startTime + '&equipmentId=' + equipmentList,
        success: function(result){
          console.log('going to parse data');
          console.log(result);
          equipmentData = result;
          //subLocationData = JSON.parse(result);
          //console.log(subLocationData);
        }
      }).done(function(){
        var energyKey;
        var energyValue;
        $('.roomData').empty();
        for(var i =0;i<equipmentData.length;i++){
          if(equipmentData[i].data.names[0] && equipmentData[i].totalEnergy)
          {
            //console.log(equipmentData[i].data.names[0] + ' -- ' + equipmentData[i].totalEnergy );
            energyKey = $('<div>');
            energyKey.attr('class','energy-key-name');
            energyKey.attr('id',equipmentData[i].id);
            energyKey.html(equipmentData[i].data.names[0]);
            energyKey.data('room-id',equipmentData[i].id);
            $('.roomData').append(energyKey);
            // energyKey.data('id',equipmentData[i].id);
            energyValue = $('<div>');
            energyValue.attr('class','energy-value');
            energyValue.html((equipmentData[i].totalEnergy*1000).toFixed(2)+ ' W' );
            $('.roomData').append(energyValue);

            energyKey.click(function(){
              console.log(this);
              console.log(this.id);
              getRoomData(this.id);
              createRooms(this.id);

              // console.log(this.dataset.dataRoomId);
            })
          }

        }
      })
      return;
    }
  }

}

function showGraph(subLocationData) {
  var range = 10;



     for(var i = 0; i < rooms.length; i++ ) {
       console.log(rooms[i]);

        var geom = new THREE.CubeGeometry( rooms[i].w, rooms[i].l, subLocationData[i].totalEnergy*5  );
             var grayness = Math.random() * 0.5 + 0.25,
                     mat = new THREE.MeshLambertMaterial(
                       {
                         color: 0xffffff
                       }
                     ),
                     cube = new THREE.Mesh( geom, mat );
                    scene.add(cube);
             //mat.color.setRGB(255, 170, 150);
             //mat.color.setRGB(Math.random(0,255),Math.random(0,255),150);
             cube.position.set(rooms[i].xpos, rooms[i].ypos, 350 + subLocationData[i].totalEnergy*5/2); // change the center of 'z' to the base
             //cube.position.set( range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) );
             cube.rotation.set( 0, 0, 0);
             cube.grayness = grayness; // *** NOTE THIS
            //  cubes.add( cube );

     }
}

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



function setupInputSliderButton()
{
  var noOfHours = 24 -parseInt($('.input-slider')[0].value);
  $('.input-slider-button').click(function(){
    makeAjaxCallToGetSchema(noOfHours);
  })
  var a = new Date(new Date() - noOfHours*60000*60);
  $('.input-slider-value').html(a.toString().slice(0,-15));

  $('.input-slider').on("click",function(){
    noOfHours = 24 -parseInt($('.input-slider')[0].value);
    var a = new Date(new Date() - noOfHours*60000*60);
    $('.input-slider-value').html(a.toString().slice(0,-15));
  })
}
