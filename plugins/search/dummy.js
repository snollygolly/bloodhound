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
    id: "99999",
    name: "Name Of Show",
    started: "2014",
    ended: "0",
    status: "Awesome",
    seasons: "1",
  };
  return show;
});
