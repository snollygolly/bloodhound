$(document).ready(function() {
  var mod_date = $(".show-mod-date").html();
  var last_update = moment(mod_date).fromNow();
  $(".show-mod-date").html(last_update);
  $(".show-mod-date").css("visibility", "visible");
});

function displayAlert(type, message){
  alert = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">';
  alert += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>';
  $("#alert-container").html(alert);
}
