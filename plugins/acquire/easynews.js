//Expose `Plugin`
module.exports = AcquirePlugin;

//Initialize Plugin.

function AcquirePlugin() {
  var config = require('../../config.json');
  this.info = {};
  this.info.slug = "easynews";
  this.info.name = "Easynews Global Search 5";
  this.info.username = config.acquire.data.easynews.username;
  this.info.password = config.acquire.data.easynews.password;
  this.info.path = "http://" + this.info.username + ":" + this.info.password + "@members.easynews.com/global5/search.html";
  this.info.cache = {
    show: 7
  };
};


//Search prototype

var acquire = AcquirePlugin.prototype;

var common = require("../base/common.js");
var log = common.log;
var Promise = common.Promise;
var request = common.request;
var cheerio = require('cheerio');

acquire.findShowURLs = Promise.coroutine(function* (name, episode) {
  //gps=the.vampire.diaries+s05e05+%21+sample
  //name and episode, excluding samples
  var searchStr = "gps=" + name + " " + episode + " ! sample";
  //video i guess? / sorting
  searchStr += "&fty%5B%5D=VIDEO&s1=dsize&s1d=%2B&s2=nrfile&s2d=%2B&s3=dsize&s3d=%2B";
  //fly. something to do with air travel? best to leave it in i think
  searchStr += "&fly=2";
  var response = yield request.getAsync(this.info.path + "?" + searchStr).get(0);
  if (response.statusCode != 200){
    throw new Error('Bad username/password at acquire.findShowURLs (' + this.info.slug + ' plugin)');
  }
  $ = cheerio.load(response.body);
  var urls = $(".rRow1").find(".autounrarlink").html();
  return urls;
});
