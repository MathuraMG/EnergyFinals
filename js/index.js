var serverUrl = "https://itpenertivserver.herokuapp.com";
// var serverUrl = "http://0.0.0.0:5000";

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

})


//Three.js
//set scene
var scene = new THREE.Scene();

var SCREEN_WIDTH = window.innerWidth*0.7, SCREEN_HEIGHT = window.innerHeight*0.7;
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

var render = function() {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
  renderer.setSize(window.innerWidth*0.7 - 20, window.innerHeight*0.7 - 20);
};

console.log("*****************MATHURA***************");
console.log(render);

//set controls (using lib - OrbitControls.js)
var controls;
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render )

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
              $('.room-data-section').fadeIn(500);
              $('.floor-data-section').fadeOut(500);
              $('.three-model-container').fadeOut(500);
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

  for(var i = 0; i < rooms.length; i++ ) {

    var tempTotalEnergy = 0;
    for(var j =0;j<rooms[i].sublocationId.length;j++){
      tempTotalEnergy += getEnergyForSubLocation(rooms[i].sublocationId[j]);
    }

    var geom = new THREE.CubeGeometry( rooms[i].w, rooms[i].l, tempTotalEnergy*5  );
    var grayness = Math.random() * 0.5 + 0.25,
    mat = new THREE.MeshLambertMaterial(
      {
      color: 0xffffff
      }
    ),

    cube = new THREE.Mesh( geom, mat );
    scene.add(cube);
    cube.position.set(rooms[i].xpos, rooms[i].ypos, tempTotalEnergy*5/2); // change the center of 'z' to the base
    cube.rotation.set( 0, 0, 0);
    cube.grayness = grayness; // *** NOTE THIS
    cube.userData = {
               id: rooms[i].sublocationId,
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
window.addEventListener( 'click', onMouseClick, false );

function onMouseMove(e)
{
  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );
  //console.log(e.clientX);

  raycaster.setFromCamera( mouseVector.clone(), camera );
  var intersects = raycaster.intersectObjects( cubes.children );
  cubes.children.forEach(function( cube ) {
    cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
  });

  for( var i = 0; i < intersects.length; i++ ) {
    var intersection = intersects[ i ],
    obj = intersection.object;
    obj.material.color.setRGB( 1.0 - i / intersects.length, 0, 0 );

  }
}

function onMouseClick(e){
  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );
  //console.log(e.clientX);

  raycaster.setFromCamera( mouseVector.clone(), camera );
  var intersects = raycaster.intersectObjects( cubes.children );
  cubes.children.forEach(function( cube ) {
    cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
  });
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
          //Object.keys(itpFloorData.data.data[0])[1]
          var temp = subLocationData[i].data.data[k][Object.keys(subLocationData[i].data.data[0])[1]];
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
    var energyKey;
    var energyValue;
    $('.roomData').empty();
    $('#visualisation').empty();
    plotLineGraph(equipmentData);
    drawTreeMap(equipmentData);

  })
  return;

}


var animate = function(){
  requestAnimationFrame( animate );
  controls.update();
};


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

//display most used Equipment in the last 5 hours
function showMostUsedEquipmentLast5Hours() {
  var mostUsedEquipmentLast5Hours = d3.select("#embed-most-used-equipment-image").append("img")
      .attr("src","http://upload.wikimedia.org/wikipedia/commons/b/b0/NewTux.svg")
      .attr("width", 200)
      .attr("height", 200)
}

//
//
// MATHURA, MOVE THIS TO ANOTHER FILE!!!!
//
//
function appendRoomLineGraph(roomData){

  console.log(roomData);
  var yMax;

  yMax = d3.max(roomData,function(d)
  {
    return d.y*1000;
  })

  var vis = d3.select('#visualisation-line')
  WIDTH = 0.8*innerWidth-40,
  HEIGHT = 0.2*innerHeight-40,
  MARGINS = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40
  }

  xRange = d3.time.scale()
  .domain([new Date(roomData[0].x), d3.time.day.offset((new Date(roomData[roomData.length-1].x)), 0
  )])
  .range([MARGINS.left, WIDTH - MARGINS.right]),

  yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom])
  .domain([0,mainLineGraphY])

  var lineFunc = d3.svg.line()
    .x(function(d) {
      return xRange(new Date(d.x));
    })
    .y(function(d) {
      return yRange(d.y*1000);
    })
    .interpolate('basis');

  vis.append('svg:path')
  .attr('d', lineFunc(roomData))
  .attr('stroke', '#aa1122')
  .attr('stroke-width', 2)
  .attr('fill', 'none')
  .attr('class','appended-line-graph');


}

function showFloorGraph(itpFloorData){
  console.log(itpFloorData);
  var yMax;

  yMax = d3.max(itpFloorData.data.data,function(d)
  {
    return d[Object.keys(itpFloorData.data.data[0])[1]]*1000;
  })

  var vis = d3.select('#visualisation-line'),
      WIDTH = 0.8*innerWidth-40,
      HEIGHT = 0.2*innerHeight-40,
      MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      },

      xRange = d3.time.scale()
      .domain([new Date(itpFloorData.data.data[0].x), d3.time.day.offset((new Date(itpFloorData.data.data[itpFloorData.data.data.length-1].x)), 0
      )])
      .range([MARGINS.left, WIDTH - MARGINS.right]),

      yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom])
      .domain([0,yMax+10]),

      xAxis = d3.svg.axis()
        .scale(xRange)
        .tickSize(2)
        .ticks(3)
        .tickFormat(d3.time.format("%e %b %I %M %p"))

      y1Axis = d3.svg.axis()
        .scale(yRange)
        .tickSize(2)
        .orient('left')
        .tickSubdivide(true);

  vis.append('svg:g')
    .attr('class', 'line-graph-axis')
    .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
    .call(xAxis);

  vis.append('svg:g')
    .attr('class', 'line-graph-axis')
    .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
    .call(y1Axis);

  var lineFunc = d3.svg.line()
    .x(function(d) {
      return xRange(new Date(d.x));
    })
    .y(function(d) {
      return yRange(d[Object.keys(itpFloorData.data.data[0])[1]]*1000);
    })
    .interpolate('basis');

  vis.append('svg:path')
  .attr('d', lineFunc(itpFloorData.data.data))
  .attr('stroke', '#444444')
  .attr('stroke-width', 2)
  .attr('fill', 'none')
  .attr('class','itp-floor-line-graph');

  return yMax+10;

}

function plotLineGraph(allLineData){

  // console.log(allLineData);
  // console.log( new Date(allLineData[0].data.data[0].x) + ' -- ' + new Date(allLineData[0].data.data[allLineData[0].data.data.length-1].x));

  var yMax = 0;
  for(var i =0;i<allLineData.length;i++){
    tempYMax = d3.max(allLineData[i].data.data,function(d)
    {
      return d[Object.keys(allLineData[i].data.data[0])[1]]*1000;
    })
    if(tempYMax>yMax){
      yMax = tempYMax;
    }
    // console.log(yMax + ' -- ' + tempYMax);
  }

  var vis = d3.select('#visualisation'),
      WIDTH = 0.5*innerWidth-40,
      HEIGHT = 0.5*innerHeight-40,
      MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      },

      xRange = d3.time.scale()
      .domain([new Date(allLineData[0].data.data[0].x), d3.time.day.offset((new Date(allLineData[0].data.data[allLineData[0].data.data.length-1].x)), 0
      )])
      .range([MARGINS.left, WIDTH - MARGINS.right]),

      yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom])
      .domain([0,yMax+10]),

      xAxis = d3.svg.axis()
        .scale(xRange)
        .tickSize(2)
        .ticks(3)
        .tickFormat(d3.time.format("%e %b %I %M %p"))

      y1Axis = d3.svg.axis()
        .scale(yRange)
        .tickSize(2)
        .orient('left')
        .tickSubdivide(true);

  vis.append('svg:g')
    .attr('class', 'line-graph-axis')
    .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
    .call(xAxis);

  vis.append('svg:g')
    .attr('class', 'line-graph-axis')
    .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
    .call(y1Axis);

  var lineFunc = d3.svg.line()
    .x(function(d) {
      return xRange(new Date(d.x));
    })
    .y(function(d) {
      return yRange(d[Object.keys(allLineData[i].data.data[0])[1]]*1000);
    })
    .interpolate('basis');

  var noOfGraphs = allLineData.length;
  //console.log('no of graphs -- ' + noOfGraphs);

  var allIndexDiv = document.getElementsByClassName('allIndexButtons')[0];
  var colorIndex =0;
  for(var i=0;i<noOfGraphs;i++){

    // console.log('drawing graph for -- ' + allLineData[i].data.names[0] );
    // console.log( 'Mathura -- ' + Object.keys(allLineData[i].data.data[0])[1] );
    var className = allLineData[i].data.names[0];
    className = className.replace(/[^\w]/gi, '');
    var color = d3.hsl(360-colorIndex*15, 0.4,0.65);
    colorIndex++;
    var classNamePath = className + ' graphPath';

    vis.append('svg:path')
    .attr('d', lineFunc(allLineData[i].data.data))
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('class',classNamePath);
  }

}

function drawTreeMap(equipmentData){
  // console.log('DRAWING A TREE MAP');

  var tree = {
    'name' : 'tree',
    'children' : []
  } ;
  for(var i =0 ;i<equipmentData.length;i++)
  {
    // console.log( equipmentData[i].data.names[0] + ' -- ' + equipmentData[i].totalEnergy*1000 );
    tree.children.push({
      'index':i,
      'name':equipmentData[i].data.names[0],
      'value':Math.floor(equipmentData[i].totalEnergy*1000),
      'size':equipmentData[i].totalEnergy*1000
    });
  }

  var width = 0.5*innerWidth-40,
    height = 0.5*innerHeight-40,
    color = d3.scale.category20c(),
    div = d3.select(".tree-map-room-container").append("div")
       .style("position", "relative");

  var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .value(function(d) { return d.size; });

  var node = div.datum(tree).selectAll(".node")
      .data(treemap.nodes)
      .enter().append("div")
      .attr("class", "tree-map-room")
    //   var className = 'class-'+allLineData[fullRoomIndex].name;
    // className = className.replace(/\s+/g, '');
      .attr("class", function(d){
        return ('tree-map-room class-' + d.name.replace(/[^\w]/gi, ''));
      } )
      .call(treeMapPosition)
      .style("background-color", function(d) {
          return d.name == 'tree' ? '#fff' : d3.hsl(360-d.index*15, 0.4,0.65) }) //color(d.name);
      .append('div')
      .on("click",function(d){
        // console.log(' you just clicked on -- ' + d.name);
        var tempClassName = '.'+d.name.replace(/[^\w]/gi, '');
        $(tempClassName).toggle(500);
        $('.class-'+d.name.replace(/[^\w]/gi, '')).toggleClass('tree-map-room-saturate');
      })
      .style("font-size", function(d) {
          return Math.max(0.5, 0.01*Math.sqrt(d.area))+'em'; })
      .text(function(d) { return d.children ? null : d.name + ' ('+ Math.floor(d.value) + ')'; });
}

function treeMapPosition() {


  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}



render();
animate();
