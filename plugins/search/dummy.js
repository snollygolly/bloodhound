//Expose `Plugin`
module.exports = SearchPlugin;

//Initialize Plugin.

var log = require("../../helpers/common.js").log;

function SearchPlugin() {
  this.info = {};
  this.info.slug = "dummy";
  this.info.name = "DUMMY API";
  //sound off!
  log.info("Plugin " + this.info.slug + " (" + this.info.name + ") initialized!");
};


//Search prototype

var search = SearchPlugin.prototype;

var common = require("../../helpers/common.js");
var Promise = common.Promise;
var request = common.request;
var xml2js = common.xml2js;

search.searchForShow = Promise.coroutine(function* (name) {
  var show = {
    show_id: "99999",
    name: "Name Of Show",
    started: "2014",
    ended: "0",
    status: "Awesome",
    seasons: "1",
  };
  return show;
});

search.getShowByID = Promise.coroutine(function* (id) {
  var show = {
    show_id: "99999",
    name: "Archer",
    started: "2014",
    status: "LIVE",
    seasons: 5,
    runtime: 30,
    showlink: "http://showlink.show"
  };

  return show;
});

search.getListingByID = Promise.coroutine(function* (id) {
  var listing= {
    show_id: "99999",
    total_episodes: 2,
    seasons: [
      {
        season: "01",
        episodes: [
          {
            episode_number: 1,
            season_number: "01",
            air_date: "2012-09-27",
            link: "http://thetvdb.com",
            title: "Pilot",
            description: "Holmes consults on a home invasion that resulted in murder."
          },
          {
            episode_number: 2,
            season_number: "02",
            air_date: "2012-09-28",
            link: "http://thetvdb.com",
            title: "Pilot Part Deux: Electric Boogaloo",
            description: "Something happened, it was something."
          }
        ]
      }
    ]
  };

  return listing;
});
