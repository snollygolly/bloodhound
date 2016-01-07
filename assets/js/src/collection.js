$(document).ready(function() {
  $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    displayAlert("danger", "Oh no! '" + jqxhr.responseJSON.error);
  });

  $('.collection-container .card').hover(function(overEvent) {
    $(this).find('.card-img-overlay').fadeIn(200);
  }, function(outEvent) {
    $(this).find('.card-img-overlay').fadeOut(200);
  });

  //use document on to affect elemented added after the DOM loads
  $(document).on("click", "#add_show", function() {
    $("#add_show").prop("disabled", true);
    show = $("#show_name").val();
    $.post("/api/addShowByName", {
      show: show
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        displayAlert("warning", "Oh no! " + data.error);
      } else {
        if ($('.collection-row').length === 0) {
          $('#empty_collection').remove();
        }
        show = data.show;
        //add them to the collection
        $newRow = $('<tr class="collection-row" id="show-' + show.global_id + '"></tr>');
        $newNameCol = $('<td class="collection-show-name col-md-11">' + show.name + '</td>');
        $newRemoveCol = $('<td class="collection-show-button col-md-1"></td>');
        $newRemoveBtn = $('<button class="btn btn-default remove_show" data-show="' + show.global_id + '" data-name="' + show.name + '" role="button">Remove</button>');

        $newNameCol.appendTo($newRow);
        $newRemoveBtn.appendTo($newRemoveCol);
        $newRemoveCol.appendTo($newRow);
        $newRow.appendTo("#collection");
        //give the alert
        displayAlert("success", "You've added '" + show.name + "' (" + show.show_id + ") to your <a href='/collection'>collection</a>");

      }
      clearInput();
    })
    .fail(function(data) {
      clearInput();
    });
  });

  $(document).on("click", ".remove_show", function() {
    // console.log("remove clicked");
    $(this).prop("disabled", true);
    show_id = $(this).attr("data-show");
    show_name = $(this).attr("data-name");
    $.post("/api/removeShow", {
      show_id: show_id
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        displayAlert("warning", "Oh no! " + data.error);
      } else {
        if (data.status == "OK") {
          // console.log($(this).parent().parent());
          $("#show-" + show_id).remove();
          if ($('.collection-row').length === 0) {
            $('<tr id="empty_collection"><td class="col-md-12" colspan="2"><i>You have no shows in your collection.</i></td></tr>').appendTo('#collection');
          }
          //give the alert
          displayAlert("success", "You've removed '" + show_name + "' (" + show_id + ") from your <a href='/collection'>collection</a>");
        }
      }
    });
  });
});

function clearInput() {
  $("#add_show").prop("disabled", false);
  $("#show_name").val("");
}