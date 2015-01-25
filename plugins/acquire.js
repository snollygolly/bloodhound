//Expose `Acquire`
module.exports = Acquire;

//Initialize acquire.

//logging
var log = require("../helpers/common.js").log;

function Acquire() {
  config = require('../config.json');
  this.config = config.acquire

  this.plugins = {};
  for (index in this.config.plugins) {
    Plugin = require('./acquire/' + this.config.plugins[index]);
    log.debug("Acquire: Attempting to load: " + this.config.plugins[index]);
    this.plugins[this.config.plugins[index]] = new Plugin();
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

acquire.findShowURLs = Promise.coroutine(function* (name, episode, plugins) {
  if (name === undefined){
    //something went wrong
    throw new Error('No valued provided for name in acquire.findShowURLs');
  }
  if (episode === undefined){
    //something went wrong
    throw new Error('No valued provided for episode in acquire.findShowURLs');
  }
  if (plugins === undefined){
    //something went wrong
    throw new Error('No valued provided for plugins in acquire.findShowURLs');
  }
  log.debug("Acquire: Attempting to get show URLs: " + name);
  globalID = common.formatName(name + "_" + episode).toLowerCase();
  try {
    doc = yield db.getDoc(plugins.acquire + "-" + globalID, "downloads");
    nowDate = moment();
  }
  catch (err){
    //fake a doc to keep going
    doc = {};
    doc.mod_date = moment();
    nowDate = moment().add(90, "days");
  }
  futureDate = moment(doc.mod_date).add(this.plugins[plugins.acquire].info.cache.show, "days");
  if (nowDate > futureDate){
    //the cache is expired
    try{
      var urls = yield this.plugins[plugins.acquire].findShowURLs(name, episode);;
    }
    catch (err){
      throw err;
    }
    log.info("Acquire: Got show (Fresh): " + name);
    urls._id = plugins.acquire + "-" + globalID;
    urls.name = name;
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
    log.info("Acquire: Got show (Cached): " + name);
  }
  return urls;
});
