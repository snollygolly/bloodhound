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

acquire.findShowURLs = Promise.coroutine(function* (name, episode) {
  //gps=the.vampire.diaries+s05e05+%21+sample
  //name and episode, excluding samples
  var searchStr = "gps=" + name + " " + episode + " ! sample ! .001";
  //video i guess? / sorting
  searchStr += "&fty%5B%5D=VIDEO&s1=dsize&s1d=%2B&s2=nrfile&s2d=%2B&s3=dsize&s3d=%2B";
  //fly. something to do with air travel? best to leave it in i think
  searchStr += "&fly=2";
  var response = yield request.getAsync(this.info.path + "?" + searchStr).get(0);
  if (response.statusCode != 200){
    throw new Error('Bad username/password at acquire.findShowURLs (' + this.info.slug + ' plugin)');
  }
  $ = cheerio.load(response.body);
  var urls = {};
  urls.suggestions = {};
  urls.results = [];
  //loop through each row
  $(".rRow1, .rRow2").each(function(i, elem) {
    var url = {};
    url.link = $(elem).find("a").attr("href");
    url.name = url.link.split("/").pop();
    url.size = $(elem).find(".fSize").text();
    url.quality = getQuality(url.name);
    url.languages = [];
    $(elem).find("img").each(function(i, img) {
      //look for any thumbnail images
      var language = $(img).attr("title").toString();
      if (url.languages.indexOf(language) === -1){
        //there's a lanugage
        url.languages.push(language);
      }
    });
    //see if this is a suggested episode
    if (!urls.suggestions.hasOwnProperty('smallest')){
      urls.suggestions.smallest = url;
    }
    if (!urls.suggestions.hasOwnProperty('four_eighty_p') && url.quality == "480p"){
      urls.suggestions.four_eighty_p = url;
    }
    if (!urls.suggestions.hasOwnProperty('seven_twenty_p') && url.quality == "720p"){
      urls.suggestions.seven_twenty_p = url;
    }
    if (!urls.suggestions.hasOwnProperty('ten_eighty_p') && url.quality == "1080p"){
      urls.suggestions.ten_eighty_p = url;
    }
    //OMGOOSES, FULL 4K SUPPORT!!!
    if (!urls.suggestions.hasOwnProperty('twenty_one_sixty_p') && url.quality == "2160p"){
      urls.suggestions.twenty_one_sixty_p = url;
    }
    urls.results.push(url);
  });
  return urls;
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
