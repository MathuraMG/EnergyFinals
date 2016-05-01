var serverUrl = "https://itpenertivserver.herokuapp.com";
// var serverUrl = "http://0.0.0.0:5000";
var schema ;
var startTime;
var timeRange;
$(document).ready(function(){
  console.log("document is ready");
  //Login and get authenticated
  setupInputSliderButton();
})

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
          if(subLocationData[i].data.names[0] && subLocationData[i].totalEnergy)
          {
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
        $('#visualisation').empty();
        plotLineGraph(equipmentData);
        drawTreeMap(equipmentData);

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
              // console.log(this.dataset.dataRoomId);
            })
          }

        }
      })
      return;
    }
  }

}

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

//
//
// MATHURA, MOVE THIS TO ANOTHER FILE!!!!
//
//

function plotLineGraph(allLineData){

  console.log(allLineData);
  console.log( new Date(allLineData[0].data.data[0].x) + ' -- ' + new Date(allLineData[0].data.data[allLineData[0].data.data.length-1].x));

  var yMax = 0;
  for(var i =0;i<allLineData.length;i++){
    tempYMax = d3.max(allLineData[i].data.data,function(d)
    {
      return d[Object.keys(allLineData[i].data.data[0])[1]]*1000;
    })
    if(tempYMax>yMax){
      yMax = tempYMax;
    }
    console.log(yMax + ' -- ' + tempYMax);
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
        //.domain([0,d3.max(allLineData[fullRoomIndex].value,function(d){return d.y/1000; })]),

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
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
      .call(xAxis);

    vis.append('svg:g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
      .call(y1Axis);

    var lineFunc = d3.svg.line()
      .x(function(d) {
        return xRange(new Date(d.x));
      })
      .y(function(d) {
        // console.log(d[Object.keys(allLineData[i].data.data[0])[1]]);
        return yRange(d[Object.keys(allLineData[i].data.data[0])[1]]*1000);
      })
      .interpolate('basis');

    var noOfGraphs = allLineData.length;
    //console.log('no of graphs -- ' + noOfGraphs);

    var allIndexDiv = document.getElementsByClassName('allIndexButtons')[0];
    var colorIndex =0;
    for(var i=0;i<noOfGraphs;i++){


      //console.log(allLineData[i].value);


    console.log('drawing graph for -- ' + allLineData[i].data.names[0] );
    // console.log( 'Mathura -- ' + Object.keys(allLineData[i].data.data[0])[1] );
    var className = allLineData[i].data.names[0];
    className = className.replace(/\s+/g, '');
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
  console.log('DRAWING A TREE MAP');

  var tree = {
    'name' : 'tree',
    'children' : []
  } ;
  for(var i =0 ;i<equipmentData.length;i++)
  {
    console.log( equipmentData[i].data.names[0] + ' -- ' + equipmentData[i].totalEnergy*1000 );
    tree.children.push({
      'index':i,
      'name':equipmentData[i].data.names[0] + ' (' + Math.floor(equipmentData[i].totalEnergy*1000) + 'W)',
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
      .call(treeMapPosition)
      .style("background-color", function(d) {
          return d.name == 'tree' ? '#fff' : d3.hsl(360-d.index*15, 0.4,0.65) }) //color(d.name);
      .append('div')
      .style("font-size", function(d) {
          return Math.max(0.5, 0.01*Math.sqrt(d.area))+'em'; })
      .text(function(d) { return d.children ? null : d.name; });
}

function treeMapPosition() {


  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}
