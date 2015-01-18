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
