$(document).ready(function(){
  console.log('this also gets called i think');
  backButton();
})

function backButton() {
  $('.back-to-home').click(function(){
    $('.room-data-section').fadeOut(500);
    $('.floor-data-section').fadeIn(500);
    $('.three-model-container').fadeIn(500);
    $('.appended-line-graph').remove();
    $('.input-slider-container').fadeIn(500);
  });
}

function setupInputSliderButton()
{
  var noOfHours = 24 -parseInt($('.input-slider')[0].value);
  // $('.input-slider-button').click(function(){
  //
  // })
  var a = new Date(new Date() - noOfHours*60000*60);
  $('.input-slider-value').html(a.toString().slice(0,-15));

  $('.input-slider-container').mouseup(function(){


    noOfHours = 24 -parseInt($('.input-slider')[0].value);
    var a = new Date(new Date() - noOfHours*60000*60);
    $('.input-slider-value').html(a.toString().slice(0,-15));
    makeAjaxCallToGetSchema(noOfHours);
    $('#visualisation-line').empty();
  })
}
