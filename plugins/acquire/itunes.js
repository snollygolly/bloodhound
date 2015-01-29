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

acquire.findShowURLs = Promise.coroutine(function* (name, episode) {
  var searchStr = "term=" + name + "&entity=tvEpisode";
  var response = yield request.getAsync(this.info.path + "?" + searchStr).get(0);
  var jsRes = JSON.parse(response.body)
  if (response.statusCode != 200){
    throw new Error('Error at acquire.findShowURLs (' + this.info.slug + ' plugin)');
  }
  var results = {};
  results.suggestions = [];
  results.results = [];
  //loop through each row
  var i = 0;
  while (i < this.info.result_limit){
    if (results.suggestions.length == 0){
      //the first result is suggested
      var result = makeResult(jsRes.results[i]);
    }else{
      //the rest of the results are included in the response
      var result = makeResult(jsRes.results[i]);
    }
    i++;
  }
  return results;
});

function makeResult(currentResult){
  var result = {};
  result.name = currentResult.trackName;
  result.link = currentResult.trackViewUrl;
  result.meta = {};
  result.meta.prices = {};
  result.meta.prices.sd = currentResult.trackPrice;
  result.meta.prices.hd = currentResult.trackHdPrice;
  result.meta.previews = {};
  result.meta.previews.img = null;
  result.meta.previews.video = currentResult.previewUrl;
  return result;
}
