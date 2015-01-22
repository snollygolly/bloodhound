$( document ).ready(function() {
  $( document ).ajaxError(function( event, jqxhr, settings, thrownError ) {
    displayAlert("danger", "Oh no! '" + jqxhr.responseJSON.error);
  });
  //use document on to affect elemented added after the DOM loads
  $(document).on("click", "#add_show",function() {
    $("#add_show").prop("disabled", true);
    show = $("#show_name").val();
    $.post( "/api/addShowByName", { show: show})
    .done(function(data) {
      if (data.error){
        //something went wrong
        displayAlert("warning", "Oh no! " + data.error);
      }else{
        show = data.show;
        //add them to the collection
        $newRow = $(".collection-row").last().clone();
        $newRow.removeClass();
        $newRow.addClass("collection-row");
        $newRow.attr("id", "show-" + show.show_id);
        $(".collection-show-name", $newRow).html(show.name);
        $(".collection-show-button", $newRow).find("button").attr("data-show", show.show_id);
        $(".collection-show-button", $newRow).find("button").attr("data-name", show.name);
        $newRow.appendTo("#collection");
        //give the alert
        displayAlert("success", "You've added '" + show.name + "' (" + show.show_id + ") to your collection");

      }
      clearInput();
    })
    .fail(function(data) {
      clearInput();
    })
  });

  $(document).on("click", ".remove_show",function() {
    console.log("remove clicked");
    $(this).prop("disabled", true);
    show_id = $(this).attr("data-show");
    show_name = $(this).attr("data-name");
    $.post( "/api/removeShow", { show_id: show_id})
    .done(function(data) {
      if (data.error){
        //something went wrong
        displayAlert("warning", "Oh no! " + data.error);
      }else{
        if (data.status == "OK"){
          console.log($(this).parent().parent());
          $("#show-" + show_id).remove();
          //give the alert
          displayAlert("success", "You've removed '" + show_name + "' (" + show_id + ") from your collection");
        }
      }
    })
  });
});

function clearInput(){
  $("#add_show").prop("disabled", false);
  $("#show_name").val("");
}

function displayAlert(type, message){
  alert = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">';
  alert += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>';
  $("#alert-container").html(alert);
}

$( document ).ready(function() {
  $(".collection-watch").change(function() {
    show_id = $("#show_id").val();
    episode_number = $(this).attr('data-episode');
    $.post( "/api/toggleWatch", { show_id: show_id, episode_number: episode_number })
    .done(function( data ) {
      if (data.error){
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1){
        $(this).prop("checked", true);
        $("#episode-" + data.episode_number).addClass("info");
      }else{
        $(this).prop("checked", false);
        $("#episode-" + data.episode_number).removeClass("info");
      }
    });
  });

  $(".collection-season-watch").click(function() {
    show_id = $("#show_id").val();
    season_number = $(this).attr('data-season');
    var episodeArr = [];
    //get an arr of the episodes in this season
    $(".season-" + season_number).each(function( index ) {
      episodeArr.push($(this).attr('data-episode'));
    });
    $.post( "/api/toggleWatch", { show_id: show_id, episode_number: episodeArr })
    .done(function( data ) {
      if (data.error){
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1){
        $(".season-" + season_number).each(function( index ) {
          $(this).prop("checked", true);
        });
        while (episodeArr.length > 0){
          $("#episode-" + episodeArr.pop()).addClass("info");
        }
      }
    });



  });
});
