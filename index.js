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
          //subLocationData = JSON.parse(result);
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
