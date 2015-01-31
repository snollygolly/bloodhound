$(document).ready(function() {
  // Mark individual episode as watched
  $(".acquire-episode").click(function() {
    var provider = $(this).attr('data-provider');
    var episode = $(this).attr('data-id');
    var ep_name = $(this).attr('data-ep-name');
    var $button = $(this);
    $.get("/api/findShowURLs", {
      provider: provider,
      episode: episode,
      ep_name: ep_name
    })
    .done(function(data) {
      if (data.error) {
        //something went wrong
        console.log(data.error);
      }
      console.log(data.results.suggestions);
      if (data.results.suggestions.length != 0){
        //there's at least one show to download
        var suggestions = [];
        suggestions.push(formatURL(data, 0));
        $button.parent().html(suggestions.join("<br>"));
      }else{
        $button.parent().html("No results found");
      }
    });
  });
});

function formatURL (data, index){
  var suggestion = "<a href=\"" + data.results.suggestions[index].link + "\" target='_blank'>" + decodeURI(data.results.suggestions[index].name) + "</a>";

  return suggestion;
}
