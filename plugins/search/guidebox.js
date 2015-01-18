//Expose `Plugin`
module.exports = SearchPlugin;

//Initialize Plugin.
function SearchPlugin() {
  var config = require('../config.json');
  this.info = {};
  this.info.slug = "guidebox";
  this.info.name = "Guidebox JSON API";
  this.info.api_key = config.search.data.guidebox.api_key;
  this.info.path = "http://api-public.guidebox.com/v1.43/json/" + this.info.api_key + "/";
  this.info.cache = {
    show: 7,
    listing: 7,
    search: 7
  };
};


//Search prototype

var search = SearchPlugin.prototype;

var common = require("../base/common.js");
var log = common.log;
var Promise = common.Promise;
var request = common.request;
var moment = common.moment;

search.searchForShow = Promise.coroutine(function* (name) {
  var response = yield request.getAsync(this.info.path + "search/title/" + name).get(0);
  var jsRes = JSON.parse(response.body);
  if (jsRes.total_results == 0){
    throw new Error('No matches for \'' + name + '\' found in search.searchForShow (' + this.info.slug + ' plugin)');
  }
  jsShow = jsRes.results.shift();
  var show = {
    show_id: jsShow.id.toString(),
    name: jsShow.title,
    started: jsShow.first_aired.split("-").shift()
  };
  return show;
});

search.getShowByID = Promise.coroutine(function* (id) {
  var response = yield request.getAsync(this.info.path + "show/" + id).get(0);
  var jsShow = JSON.parse(response.body);
  response = yield request.getAsync(this.info.path + "show/" + id + "/seasons").get(0);
  var jsSeasons = JSON.parse(response.body);
  //TODO: process the date
  //TODO: get genre and network
  if (jsSeasons.total_results == 0){
    jsShow.seasons = 0;
  }else{
    jsShow.seasons = jsSeasons.results.length;
  }
  status = convertStatus(jsShow.status);
  var show = {
    show_id: jsShow.id.toString(),
    name: jsShow.title,
    showlink: "http://thetvdb.com/?tab=series&id=" + jsShow.tvdb,
    started: jsShow.first_aired.split("-").shift(),
    status: status,
    seasons: jsShow.seasons,
    runtime: jsShow.runtime
  };
  return show;
});

search.getListingByID = Promise.coroutine(function* (id) {
  //this is the max supported by the API
  var episodesPerRequest = 100;
  //get the first 100 episodes from the API
  var currentResult = 0;
  var totalResults = 1;
  //set up the objects
  var listing = {};
  listing.show_id = id.toString();
  listing.seasons = [];
  var seasonObj = {};
  seasonObj.episodes = [];
  var currentSeason = 0;
  var results = [];
  while (currentResult < totalResults){
  //while (currentResult <= 1){
    //this should ensure that we get all the results for a show
    if (results.length == 0){
      //we are out of results, let's grab some more
      var response = yield request.getAsync(this.info.path + "show/" + id + "/episodes/all/" + currentResult + "/100/all/all").get(0);
      var jsListing = JSON.parse(response.body);
      results = jsListing.results;
      totalResults = jsListing.total_results;
      //they give us these numbers, might as well error trap!
      if (jsListing.total_returned != results.length){
        //this shouldn't happen!
        var error = "plugins/search/guidebox: Listing results don't match totals sent!"
        log.warn(error);
        throw new Error(error);
      }
      batchCount = 0;
    }
    //increase the counters
    currentResult++;
    var result = results.shift();
    //start building the season
    if (result.season_number != currentSeason || currentResult == totalResults){
      //should we push the season object to the listing?
      if (seasonObj.episodes.length != 0){
        listing.seasons.unshift(seasonObj);
      }
      //this is the first episode of the season
      currentSeason = result.season_number;
      seasonObj = {};
      seasonObj.season = common.padNumber(result.season_number);
      seasonObj.episodes = [];
    }
    var episodeObj = {
      episode_number : totalResults - currentResult,
      season_number : common.padNumber(parseInt(result.episode_number)),
      air_date : result.first_aired,
      link : "http://thetvdb.com/?tab=series&id=" + id + "&id=" + result.tvdb,
      title : result.title,
      description: result.overview
    };
    seasonObj.episodes.unshift(episodeObj);
  }
  return listing;
});

function convertStatus(status){
  var liveArr = [
    "Continuing"
  ];
  var deadArr = [
    "Ended",
    "Canceled/Ended"
  ];
  //set default status
  returnStatus = "UNKNOWN [" + status + "]";
  if (liveArr.indexOf(status) != -1){
    //show is still airing
    returnStatus = "LIVE";
  }else if (deadArr.indexOf(status) != -1){
    returnStatus = "DEAD";
  }
  return returnStatus;
}
