$(document).ready(function() {
  // Mark individual episode as watched
  $(".collection-watch").change(function() {
    show_id = $("#show_id").val();
    episode_number = $(this).attr('data-episode');
    $.post("/api/toggleWatch", {
      show_id: show_id,
      episode_number: episode_number
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1) {
        $(this).prop("checked", true);
        $("#episode-" + data.episode_number).addClass("info");
      } else {
        $(this).prop("checked", false);
        $("#episode-" + data.episode_number).removeClass("info");
      }
    });
  });

  // Mark all episodes of a season as watched
  $(".collection-season-watch").click(function() {
    show_id = $("#show_id").val();
    season_number = $(this).attr('data-season');
    var episodeArr = [];
    //get an arr of the episodes in this season
    $(".season-" + season_number).each(function(index) {
      if ($(this).prop("disabled") != true){
        episodeArr.push($(this).attr('data-episode'));
      }
    });
    $.post("/api/toggleWatch", {
      show_id: show_id,
      episode_number: episodeArr
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1) {
        $(".season-" + season_number).each(function(index) {
          if ($(this).prop("disabled") != true){
            $(this).prop("checked", true);
          }
        });
        while (episodeArr.length > 0) {
          $("#episode-" + episodeArr.pop()).addClass("info");
        }
      }
    });
  });

  // Mark all episodes of a show as watched
  $(".collection-show-watch").click(function() {
    var show_id = $("#show_id").val();
    var season_count = parseInt($("#season_count").text());
    var episodeArr = [];

    var current_season = "";
    for (var i = 1; i <= season_count; i++) {
      i < 10 ? current_season = ".season-0" + i : current_season = ".season-" + i;
      $(current_season).each(function(index) {
        if ($(this).prop("disabled") != true){
          //this episode is in the future and shouldn't be watched
          episodeArr.push($(this).attr('data-episode'));
        }
      });
    }

    $.post("/api/toggleWatch", {
      show_id: show_id,
      episode_number: episodeArr
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      if (data.watched === 1) {
        $(current_season).each(function(index) {
          if ($(this).prop("disabled") != true){
            $(this).prop("checked", true);
          }
        });
        while (episodeArr.length > 0) {
          $("#episode-" + episodeArr.pop()).addClass("info");
        }
      }
    });
  });
});
