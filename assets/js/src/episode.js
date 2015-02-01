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
        suggestions.push(formatResult(data.results.suggestions[0], 0));
        $button.parent().html(suggestions.join("<br>"));
        suggestions += "<p>" + data.results.results.length + " more results</p>";
      }else{
        $button.parent().html("No results found");
      }
    });
  });
});

function formatResult (result){
  var htmlResult = "<a href=\"" + result.link + "\" target='_blank'>" + decodeURI(result.name) + "</a>";
  htmlResult += "<div class='result-div'>";
  htmlResult += formatMetaPrices(result);
  htmlResult += formatMetaSize(result);
  htmlResult += formatMetaLanguages(result);
  htmlResult += formatMetaQuality(result);
  htmlResult += "</div>";
  return htmlResult;
}

function formatMetaPrices (result){
  //for formatting meta prices
  var htmlResult = "";
  if (typeof result.meta.prices != 'undefined'){
    htmlResult += "<ul class='result-meta-prices'>";
    if (typeof result.meta.prices.sd != 'undefined'){
      htmlResult += "<li><span class='badge'>SD</span> $" + result.meta.prices.sd + "</li>";
    }
    if (typeof result.meta.prices.hd != 'undefined'){
      htmlResult += "<li><span class='badge'>HD</span> $" + result.meta.prices.hd + "</li>";
    }
    htmlResult += "</ul>";
  }
  return htmlResult;
}

function formatMetaSize (result){
  //for formatting file sizes
  var htmlResult = "";
  if (result.meta.size){
    htmlResult += "<p>" + result.meta.size + "</p>";
  }
  return htmlResult;
}

function formatMetaLanguages (result){
  //for formatting an array of languages
  var htmlResult = "";
  if (result.meta.languages){
    if (result.meta.languages.length > 0){
      htmlResult += "<p>" + result.meta.languages.join(", ") + "</p>";
    }else{
      htmlResult += "<p>No Language Information Provided</p>";
    }
  }
  return htmlResult;
}

function formatMetaQuality (result){
  //for formatting the quality (res) of a video
  var htmlResult = "";
  if (result.meta.quality){
    htmlResult += "<p>Quality: <span class='badge'>" + result.meta.quality + "</span></p>"
  }
  return htmlResult;
}
