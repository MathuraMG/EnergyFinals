$(document).ready(function(){
  console.log('this also gets called i think');
  backButton();
})

function backButton() {
  $('.back-to-home').click(function(){
    $('.room-data-section').fadeOut(500);
    $('.floor-data-section').fadeIn(500);
  });
}
