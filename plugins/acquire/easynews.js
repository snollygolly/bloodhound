//Expose `Plugin`
module.exports = AcquirePlugin;

//Initialize Plugin.

function AcquirePlugin(user) {
  this.info = {};
  this.info.slug = "easynews";
  this.info.name = "Easynews Global Search 5";
  this.info.username = user.plugin_data.acquire.easynews.username;
  this.info.password = user.plugin_data.acquire.easynews.password;
  this.info.size = user.plugin_data.acquire.easynews.size;
  this.info.path = "http://" + this.info.username + ":" + this.info.password + "@members.easynews.com/global5/search.html";
  this.info.cache = {
    show: 7
  };
};


//Search prototype

var acquire = AcquirePlugin.prototype;

var common  = require("../../helpers/common.js");
var log = common.log;
var Promise = common.Promise;
var request = common.request;
var cheerio = require('cheerio');

acquire.findShowURLs = Promise.coroutine(function* (name, episode, ep_name) {
  //gps=the.vampire.diaries+s05e05+%21+sample
  //name and episode, excluding samples
  var searchStr = "gps=" + name + " " + episode + " ! sample ! .001";
  //video i guess? / sorting
  searchStr += "&fty%5B%5D=VIDEO&s1=dsize&s1d=%2B&s2=nrfile&s2d=%2B&s3=dsize&s3d=%2B";
  //fly. something to do with air travel? best to leave it in i think
  searchStr += "&fly=2";
  //to only show results larger than 50mb
  searchStr += "&b1t=14";
  var response = yield request.getAsync(this.info.path + "?" + searchStr).get(0);
  log.warn(this.info.path + "?" + searchStr);
  if (response.statusCode != 200){
    throw new Error('Bad username/password at acquire.findShowURLs (' + this.info.slug + ' plugin)');
  }
  $ = cheerio.load(response.body);
  var result_limit = this.info.result_limit;
  var results = {};
  results.suggestions = [];
  results.results = [];
  //loop through each row
  $(".rRow1, .rRow2").each(function(i, elem) {
    var result = {};
    result.link = $(elem).find("a").attr("href");
    result.name = result.link.split("/").pop();
    result.meta = {};
    result.meta.size = $(elem).find(".fSize").text();
    result.meta.quality = getQuality(result.name);
    result.meta.languages = [];
    $(elem).find("img").each(function(i, img) {
      //look for any thumbnail images
      var language = $(img).attr("title").toString();
      if (result.meta.languages.indexOf(language) === -1){
        //there's a lanugage
        result.meta.languages.push(language);
      }
    });
    if (results.suggestions.length == 0){
      //this is the first result
      results.suggestions.push(result);
    }else{
      results.results.push(result);
    }
  });
  return results;
});



function getQuality(name){
  //pass it a name and it tells what res it is
  if (name.indexOf("480p") > -1){
    return "480p";
  }
  if (name.indexOf("720p") > -1){
    return "720p";
  }
  if (name.indexOf("1080p") > -1){
    return "1080p";
  }
  if (name.indexOf("2160p") > -1){
    return "2160p";
  }
  return "unknown";
}
