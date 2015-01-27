$(document).ready(function() {
  // Mark individual episode as watched
  $(".acquire-episode").click(function() {
    var provider = $(this).attr('data-provider');
    var episode = $(this).attr('data-id');
    var $button = $(this);
    $.get("/api/findShowURLs", {
      provider: provider,
      episode: episode
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      console.log(data.urls.suggestions);
      if (data.urls.suggestions){
        //there's at least one show to download
        var suggestions = [];
        if (data.urls.suggestions.smallest){
          suggestions.push(formatURL(data, "smallest"));
        }
        if (data.urls.suggestions.four_eighty_p){
          suggestions.push(formatURL(data, "four_eighty_p"));
        }
        if (data.urls.suggestions.seven_twenty_p){
          suggestions.push(formatURL(data, "seven_twenty_p"));
        }
        if (data.urls.suggestions.ten_eighty_p){
          suggestions.push(formatURL(data, "ten_eighty_p"));
        }
        if (data.urls.suggestions.twenty_one_sixty_p){
          suggestions.push(formatURL(data, "twenty_one_sixty_p"));
        }
      }
      $button.parent().html(suggestions.join("<br>"));
    });
  });
});

function formatURL (data, quality){
  if (data.urls.suggestions){
    //there's at least one show to download
    var qualityBadge = '<span class="badge">' + data.urls.suggestions[quality].quality + '</span>'
    if (data.urls.suggestions[quality].languages.length != 0){
      if (data.urls.suggestions[quality].languages.indexOf("English") != -1){
        //english is a supported language
        var languagesBadge = '<img src="/assets/img/blank.png" class="flag flag-us" alt="English" />';
      }
    }else{
      var languagesBadge = '<img src="/assets/img/blank.png" class="flag" alt="Unknown" />';
    }

    var suggestion = qualityBadge + languagesBadge + " <a href=\"" + data.urls.suggestions[quality].link + "\">" + decodeURI(data.urls.suggestions[quality].name) + "</a> - [" + data.urls.suggestions[quality].size + "]<br>";
  }else{
    var suggestion = "No Results Found";
  }
  return suggestion;
}
