// var serverUrl = "https://itpenertivserver.herokuapp.com";
var serverUrl = 'https://agile-reef-71741.herokuapp.com';
// var serverUrl = "http://0.0.0.0:5000";
var oneMin = 120*1000;

var outletToCheck = '3297470f-7277-4820-b8f6-6e7a28879067';

//call the outlet every 1 minute to check if the number has changed
setInterval(function(){
  var now = new Date();
  now.setSeconds(0);
  startTime1 = now - oneMin;
  startTime1 = new Date(startTime1);
  startTime1 = startTime1.toISOString();
  startTime1 = startTime1.slice(0,-5);
  console.log(startTime1);
  var tempUrl = serverUrl + '/floordata_itp?startTime=' + startTime1 + '&equipmentId=' + outletToCheck;
  console.log(tempUrl);
  $.ajax({
    url: tempUrl,
    success: function(result){
      console.log('here is the result');
      console.log(result);
      displayPlugItInData(result);


      }
    })
  }, 60000);

  function displayPlugItInData(result){
    $('.plug-it-in-value').html((result[0].data.data[0]['Outlet']*1000).toFixed(0) + ' W');
  }
