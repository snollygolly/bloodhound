//Expose `Plugin`
module.exports = SearchPlugin;

//Initialize Plugin.
function SearchPlugin() {
  var config = require('../../config.json');
  this.info = {};
  this.info.slug = "rovi";
  this.info.name = "Rovi JSON API";
  this.info.api_key = config.search.data.rovi.search.key;
  this.info.secret = config.search.data.rovi.search.secret;
  this.info.path = "http://api.rovicorp.com/";
  this.info.params = "?entitytype=tvseries&language=en&country=US&format=json&apikey=" + this.info.api_key;
  this.info.cache = {
    show: 7,
    listing: 7,
    search: 30
  };
};


// Search prototype
var search  = SearchPlugin.prototype,
    common  = require("../../helpers/common.js"),
    log     = common.log,
    Promise = common.Promise,
    request = common.request,
    moment  = common.moment,
    crypto = require('crypto');

search.searchForShow = Promise.coroutine(function* (name) {
  //using a max results of three, hoping this speeds things up
  name = encodeURIComponent(name);
  var query = this.info.params + generateSig(this.info.api_key, this.info.secret) + "&entitytype=tvseries&size=3&query=" + name;
  var response = yield request.getAsync(this.info.path + "search/v2.1/video/search" + query).get(0);
  var jsRes = JSON.parse(response.body);
  //if we don't get a 200 code...
  if (jsRes.searchResponse.controlSet.code != 200){
    throw new Error('Got response code ' + jsRes.searchResponse.controlSet.code + ' in search.searchForShow (' + this.info.slug + ' plugin)');
  }
  if (jsRes.searchResponse.results.length == 0){
    throw new Error('No matches for \'' + name + '\' found in search.searchForShow (' + this.info.slug + ' plugin)');
  }
  jsShow = jsRes.searchResponse.results.shift();
  var show = {
    show_id: jsShow.id.toString(),
    name: jsShow.video.masterTitle,
    started: jsShow.video.releaseYear.toString()
  };
  return show;
});

search.getShowByID = Promise.coroutine(function* (id) {

});

search.getListingByID = Promise.coroutine(function* (id) {

});

function generateSig(api_key, secret){
  //required to generate sig
  try{
    var curdate = new Date();
    var gmtstring = curdate.toGMTString();
    var utc = Date.parse(gmtstring) / 1000;
    var sigString = api_key + secret + utc;
    return "&sig=" + crypto.createHash('md5').update(sigString).digest('hex');
  }
  catch (err){
    throw new Error('Failed to generate signature (' + this.info.slug + ' plugin)');
  }
}

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
