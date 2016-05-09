function drawCircles(equipmentData){
  console.log('DRAWING CIRCLES');

  var data = d3.range(20).map(function() { return [Math.random() * innerWidth/2, Math.random() * 485]; });
  var color = d3.scale.category10();

  var circles = d3.select(".circles-container")
      .on("touchstart", nozoom)
      .on("touchmove", nozoom)
    .append("svg")
      .attr("width", innerWidth * 0.7)
      .attr("height", innerHeight * 0.8)
    .selectAll("circle")
      .data(data)
    .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + d + ")"; })
      .attr("r", 32)
      .style("fill", function(d, i) { return color(i); })
      .on("click", showEquipmentDetails)


  function showEquipmentDetails(d, i) {
    //if (d3.event.defaultPrevented) return; // dragged

    d3.select(this).transition()
        .style("fill", "black")
        .attr("r", 64)
        .transition()
        .attr("r", 32)
        .style("fill", color(i));

    d3.select("circles").append("text")
                   .text("hello");
  }

  function nozoom() {
    d3.event.preventDefault();
  }


}

function appendRoomLineGraph(roomData){

  console.log(roomData);
  var yMax;

  yMax = d3.max(roomData,function(d)
  {
    return d.y*1000;
  })

  var vis = d3.select('#visualisation-line')
  WIDTH = innerWidth-40,
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
      WIDTH = innerWidth-40,
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
        .ticks(5)
        .tickFormat(d3.time.format("%e %b %I %M %p"))

      y1Axis = d3.svg.axis()
        .scale(yRange)
        .tickSize(2)
        .ticks(3)
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
      WIDTH = 0.69*innerWidth-40,
      HEIGHT = 0.34*innerHeight-40,
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
    .call(xAxis)
    .attr('stroke', '#000')
    .attr('fill', '#000')
    .attr('width', '0.5px')

  vis.append('svg:g')
    .attr('class', 'line-graph-axis')
    .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
    .call(y1Axis)
    .attr('stroke', '#000')
    .attr('fill', '#000')
    .attr('width', '0.5px')

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
    var color = d3.rgb((360-colorIndex*15)%150+100, (360-colorIndex*15)%150+100,(360-colorIndex*15)%150+100);
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

function drawCircles(equipmentData){
  console.log('DRAWING CIRCLES');

  var data = d3.range(20).map(function() { return [Math.random() * innerWidth/2, Math.random() * 485]; });
  var color = d3.scale.category10();

  var circles = d3.select(".circles-container")
      .on("touchstart", nozoom)
      .on("touchmove", nozoom)
    .append("svg")
      .attr("width", innerWidth * 0.7)
      .attr("height", innerHeight * 0.7)
    .selectAll("circle")
      .data(data)
    .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + d + ")"; })
      .attr("r", 32)
      .style("fill", function(d, i) { return color(i); })
      .on("click", showEquipmentDetails)


  function showEquipmentDetails(d, i) {
    //if (d3.event.defaultPrevented) return; // dragged

    d3.select(this).transition()
        .style("fill", "black")
        .attr("r", 64)
        .transition()
        .attr("r", 32)
        .style("fill", color(i));

    d3.select("circles").append("text")
                   .text("hello");
  }

  function nozoom() {
    d3.event.preventDefault();
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

  var width = 0.7*innerWidth-40,
    height = 0.34*innerHeight-40,
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
          return d.name == 'tree' ? '#fff' : d3.rgb((360-d.index*15)%150+100, (360-d.index*15)%150+100,(360-d.index*15)%150+100)}) //color(d.name);
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
