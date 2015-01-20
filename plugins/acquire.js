//Expose `Acquire`
module.exports = Acquire;

//Initialize acquire.

//logging
var log = require("./base/common.js").log;

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
var common = require("./base/common.js");
var db = require("./base/db.js");
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
  urls = yield this.plugins[plugins.acquire].findShowURLs(name, episode);
  return urls;
});
