//Expose `Plugin`
module.exports = SearchPlugin;

//Initialize Plugin.

//logging
//var log = require("../base/common.js").log;

function SearchPlugin() {
  this.info = {};
  this.info.slug = "tv_rage";
  this.info.name = "TV Rage XML API";
  this.info.path = "http://services.tvrage.com/feeds/";
  this.info.cache = {
    show: 7,
    listing: 7,
    search: 30
  };
  //sound off!
  //log.info("Plugin " + this.info.slug + " (" + this.info.name + ") initialized!");
};


//Search prototype

var search = SearchPlugin.prototype;

var common = require("../../helpers/common.js");
var log = common.log;
var Promise = common.Promise;
var request = common.request;
var xml2js = common.xml2js;
var moment = common.moment;

search.searchForShow = Promise.coroutine(function* (name) {
  var searchStr = common.formatName(name).toLowerCase();
  var response = yield request.getAsync(this.info.path + "search.php?show=" + searchStr).get(0);
  var jsRes = yield xml2js.parseStringAsync(response.body);
  if (jsRes.Results == 0){
    throw new Error('No matches for \'' + searchStr + '\' found in search.searchForShow (' + this.info.slug + ' plugin)');
  }
  jsShow = jsRes.Results.show.shift();
  var show = {
    show_id: jsShow.showid.shift(),
    name: jsShow.name.shift(),
    started: jsShow.started.shift()
  };
  return show;
});

search.getShowByID = Promise.coroutine(function* (id) {
  var response = yield request.getAsync(this.info.path + "showinfo.php?sid=" + id).get(0);
  var jsRes = yield xml2js.parseStringAsync(response.body);
  jsShow = jsRes.Showinfo;
  //TODO: process the date
  //TODO: get genre and network
  var show = {
    show_id: jsShow.showid.shift(),
    name: jsShow.showname.shift(),
    showlink: jsShow.showlink.shift(),
    started: jsShow.started.shift(),
    status: convertStatus(jsShow.status.shift()),
    seasons: jsShow.seasons.shift(),
    runtime: jsShow.runtime.shift()
  };
  return show;
});

search.getListingByID = Promise.coroutine(function* (id) {
  var response = yield request.getAsync(this.info.path + "episode_list.php?sid=" + id).get(0);
  var jsRes = yield xml2js.parseStringAsync(response.body);
  rawEpList = jsRes.Show.Episodelist.shift().Season;
  var listing = {};
  listing.show_id = id;
  listing.seasons = [];
  episodes = 0;
  //loop through each season
  for (index in rawEpList) {
    if (rawEpList[index]["$"]){
      //i don't think this is needed, but it's nice to have
      seasonNum = common.padNumber(parseInt(rawEpList[index]["$"].no));
    }
    seasonObj = {};
    seasonObj.season = seasonNum;
    seasonObj.episodes = [];
    //this isn't being used at the moment because i've found dupes.
    //episode_number : parseInt(rawEpList[index].episode[showIndex].epnum)
    for (showIndex in rawEpList[index].episode) {
      episodes++;
      episodeObj = {
        episode_number : episodes,
        season_number : common.padNumber(parseInt(rawEpList[index].episode[showIndex].seasonnum)),
        air_date : rawEpList[index].episode[showIndex].airdate.shift(),
        link : rawEpList[index].episode[showIndex].link.shift(),
        title : rawEpList[index].episode[showIndex].title.shift()
      };
      seasonObj.episodes.push(episodeObj);
    }
    listing.seasons.push(seasonObj);
  }
  listing.total_episodes = episodes;
  return listing;
});

function convertStatus(status){
  var liveArr = [
    "Returning Series"
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
