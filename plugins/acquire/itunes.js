//Expose `Plugin`
module.exports = AcquirePlugin;

//Initialize Plugin.

function AcquirePlugin(user) {
  this.info = {};
  this.info.slug = "itunes";
  this.info.name = "iTunes Search API v2";
  this.info.path = "https://itunes.apple.com/search";
  this.info.result_limit = 5;
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

acquire.findShowURLs = Promise.coroutine(function* (name, episode, meta) {
  var searchStr = "term=" + meta + "&entity=tvEpisode";
  var response = yield request.getAsync(this.info.path + "?" + searchStr).get(0);
  var jsRes = JSON.parse(response.body)
  if (response.statusCode != 200){
    throw new Error('Error at acquire.findShowURLs (' + this.info.slug + ' plugin)');
  }
  if (jsRes.resultCount == 0){
    return {};
  }
  var results = {};
  results.suggestions = [];
  results.results = [];
  //loop through each row
  var i = 0;
  while (i < this.info.result_limit && i < jsRes.resultCount){
    var result = {};
    log.warn("jsRes.results[i]", jsRes.results[i]);
    result.name = jsRes.results[i].trackName;
    result.link = jsRes.results[i].trackViewUrl;
    result.meta = {};
    result.meta.prices = {};
    result.meta.prices.sd = jsRes.results[i].trackPrice;
    result.meta.prices.hd = jsRes.results[i].trackHdPrice;
    result.meta.previews = {};
    result.meta.previews.img = null;
    result.meta.previews.video = jsRes.results[i].previewUrl;
    //choose where to put it
    if (results.suggestions.length == 0){
      results.suggestions.push(result);
    }else{
      results.results.push(result);
    }
    i++;
  }
  return results;
});
