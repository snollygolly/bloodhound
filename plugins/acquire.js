//Expose `Acquire`
module.exports = Acquire;

//Initialize acquire.

//logging
var log = require("../helpers/common.js").log;

function Acquire(user) {
  config = require('../config.json');
  this.config = config.acquire

  this.plugins = {};
  for (index in this.config.plugins) {
    Plugin = require('./acquire/' + this.config.plugins[index]);
    log.debug("Acquire: Attempting to load: " + this.config.plugins[index]);
    this.plugins[this.config.plugins[index]] = new Plugin(user);
    log.info("Acquire: Loaded: " + this.config.plugins[index]);
  }
};


//Acquire prototype

var acquire = Acquire.prototype;
var common  = require("../helpers/common.js");
var db = require("../helpers/db.js");
var Promise = common.Promise;
var request = common.request;
var moment = common.moment;
var settings = require("../models/settings");

acquire.findShowURLs = Promise.coroutine(function* (name, episode, plugin) {
  if (name === undefined){
    //something went wrong
    throw new Error('No valued provided for name in acquire.findShowURLs');
  }
  if (episode === undefined){
    //something went wrong
    throw new Error('No valued provided for episode in acquire.findShowURLs');
  }
  if (plugin === undefined){
    //something went wrong
    throw new Error('No valued provided for plugin in acquire.findShowURLs');
  }
  var show_id = name;
  name = name.split("_").splice(0, name.split("_").length - 1).join(" ");
  log.debug("Acquire: Attempting to get show URLs: " + show_id);
  globalID = common.formatName(show_id + "_" + episode).toLowerCase();
  try {
    doc = yield db.getDoc(plugin + "-" + globalID, "downloads");
    nowDate = moment();
  }
  catch (err){
    //fake a doc to keep going
    doc = {};
    doc.mod_date = moment();
    nowDate = moment().add(90, "days");
  }
  futureDate = moment(doc.mod_date).add(this.plugins[plugin].info.cache.show, "days");
  if (nowDate > futureDate){
    //the cache is expired
    try{
      var urls = yield this.plugins[plugin].findShowURLs(name, episode);;
    }
    catch (err){
      throw err;
    }
    log.info("Acquire: Got show (Fresh): " + show_id);
    urls._id = plugin + "-" + globalID;
    urls.name = show_id;
    urls.episode = episode;
    urls.mod_date = moment();
    if (doc._rev){
      //if there's already a rev, this is an update, not an overwrite
      urls._rev = doc._rev;
    }
    try{
      urls.global_id = globalID;
      //save the show
      urls = yield db.saveDoc(urls, "downloads");
    }catch (err){
      throw err;
    }
    log.debug("Acquire: Saved show into DB");
  }else{
    //the cache is still fresh
    var urls = doc;
    log.info("Acquire: Got show (Cached): " + show_id);
  }
  return urls;
});
