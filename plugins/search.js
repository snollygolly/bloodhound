//Expose `Search`
module.exports = Search;

//Initialize search.

//logging
var log = require("./base/common.js").log;

function Search() {
  config = require('../config.json');
  this.config = config.search

  this.plugins = {};
  for (index in this.config.plugins) {
    Plugin = require('./search/' + this.config.plugins[index]);
    log.debug("Search: Attempting to load: " + this.config.plugins[index]);
    this.plugins[this.config.plugins[index]] = new Plugin();
    log.info("Search: Loaded: " + this.config.plugins[index]);
  }
};


//Search prototype

var search = Search.prototype;
var common = require("./base/common.js");
var db = require("./base/db.js");
var Promise = common.Promise;
var request = common.request;
var moment = common.moment;
var settings = require("../models/settings");

var getID = Promise.coroutine(function* (id, plugin) {
  //give us the global id and the plugin id want want
  if (id === undefined){
    //something went wrong
    throw new Error('No valued provided for id in search.translateID');
  }
  if (plugin === undefined){
    //something went wrong
    throw new Error('No valued provided for plugin in search.translateID');
  }
  try {
    doc = yield db.getDoc(id, "index");
  }
  catch (err){
    //an index doesn't exist
    throw new Error('No document found (' + id + ') in search.translateID');
  }

  try {
    if (doc.plugin[plugin] === undefined){
      //they've switched plugins and never done a pull with this plugin, let's do that
      //fake the plugins obj
      plugins = {};
      plugins.search = plugin;
      //you can't just use the searchForShow function, the plugins aren't init-ed
      var newSearch = new Search();
      show = yield newSearch.searchForShow(doc.name, plugins);
      doc.plugin[plugin] = show.show_id;
      doc = yield db.saveDoc(doc, "index");
    }
  }
  catch (err){
    throw err;
  }
  return doc.plugin[plugin];
});

var saveID = Promise.coroutine(function* (show, plugin) {
  //give us the show obj and the plugin name it belongs to
  if (show === undefined){
    //something went wrong
    throw new Error('No valued provided for show in search.saveID');
  }
  if (plugin === undefined){
    //something went wrong
    throw new Error('No valued provided for plugin in search.saveID');
  }
  globalID = common.formatName(show.name + "_" + show.started).toLowerCase();
  try {
    doc = yield db.getDoc(globalID, "index");
  }
  catch (err){
    //an index doesn't exist, let's make one
    var doc = {
      _id: globalID,
      name: show.name,
      plugin: {}
    };
  }
  //they already have an index saved, let's check if the one we want is there
  if (!doc.plugin[plugin] || doc.plugin[plugin] != show.show_id){
    //it's not there, let's add it
    doc.plugin[plugin] = show.show_id;
  }else{
    //let's leave before the saving
    return doc;
  }
  try{
    doc = yield db.saveDoc(doc, "index");
  }catch (err){
    throw new Error('Something went wrong when saving (' + doc._id + ') in search.saveID');
  }
  return doc;
});

//starting public functions

search.searchForShow = Promise.coroutine(function* (name, plugins) {
  var searchStr = common.formatName(name).toLowerCase();
  log.debug("Search: Attempting to get information for show: " + searchStr);
  if (name === undefined){
    //something went wrong
    throw new Error('No valued provided for name in search.searchForShow');
  }
  if (plugins === undefined){
    //something went wrong
    throw new Error('No valued provided for plugins in search.searchForShow');
  }
  try {
    doc = yield db.getDoc(plugins.search + "-" + searchStr, "searches");
    nowDate = moment();
  }
  catch (err){
    //fake a doc to keep going
    doc = {};
    doc.mod_date = moment();
    nowDate = moment().add(90, "days");
  }
  futureDate = moment(doc.mod_date).add(this.plugins[plugins.search].info.cache.search, "days");
  if (nowDate > futureDate){
    //the cache is expired
    try{
      //we're still filtering the search string everywhere else, but let the plugin do it here
      var show = yield this.plugins[plugins.search].searchForShow(name);
    }
    catch (err){
      throw err;
    }
    log.info("Search: Got search for show (Fresh): " + show.show_id);
    show._id = plugins.search + "-" + searchStr;
    show.mod_date = moment();
    if (doc._rev){
      //if there's already a rev, this is an update, not an overwrite
      show._rev = doc._rev;
    }
    try{
      //let's update the index
      index = yield saveID(show, plugins.search);
      show.global_id = index._id;
      //save the show
      show = yield db.saveDoc(show, "searches");
    }catch (err){
      throw err;
    }
    log.debug("Search: Saved show into DB");
  }else{
    //the cache is still fresh
    var show = doc;
    log.info("Search: Got search for show (Cached): " + show.show_id);
  }
  return show;
});

search.getShowByID = Promise.coroutine(function* (id, plugins) {
  //get the doc from the database to avoid API lookups
  log.debug("Search: Attempting to get information for show: " + id);
  if (id === undefined){
    //something went wrong
    throw new Error('No valued provided for id in search.getShowByID');
  }
  if (plugins === undefined){
    //something went wrong
    throw new Error('No valued provided for plugins in search.getShowByID');
  }
  try {
    //replace the global id with a plugin id
    globalID = id;
    id = yield getID(id, plugins.search);
    //get the doc
    doc = yield db.getDoc(plugins.search + "-" + id, "shows");
    nowDate = moment();
  }
  catch (err){
    //fake a doc to keep going
    doc = {};
    doc.mod_date = moment();
    nowDate = moment().add(90, "days");
  }
  futureDate = moment(doc.mod_date).add(this.plugins[plugins.search].info.cache.show, "days");
  if (nowDate > futureDate){
    //the cache is expired
    try{
      var show = yield this.plugins[plugins.search].getShowByID(id);
    }
    catch (err){
      throw err;
    }
    log.info("Search: Got info for show (Fresh): " + show.show_id);
    show._id = plugins.search + "-" + show.show_id;
    show.mod_date = moment();
    if (doc._rev){
      //if there's already a rev, this is an update, not an overwrite
      show._rev = doc._rev;
    }
    try{
      show.global_id = globalID;
      show = yield db.saveDoc(show, "shows");
    }catch (err){
      throw err;
    }

    log.debug("Search: Saved show into DB");
  }else{
    //the cache is still fresh
    var show = doc;
    log.info("Search: Got info for show (Cached): " + show.show_id);
  }
  return show;
});

search.getListingByID = Promise.coroutine(function* (id, plugins) {
  //get the doc from the database to avoid API lookups
  if (id === undefined){
    //something went wrong
    throw new Error('No valued provided for id in search.getShowByID');
  }
  if (plugins === undefined){
    //something went wrong
    throw new Error('No valued provided for plugins in search.getShowByID');
  }
  log.debug("Search: Attempting to get listing for show: " + id);
  try {
    //replace the global id with a plugin id
    globalID = id;
    id = yield getID(id, plugins.search);
    //get the doc
    doc = yield db.getDoc(plugins.search + "-" + id, "listings");
    nowDate = moment();
  }
  catch (err) {
    //fake a doc to keep going
    doc = {};
    doc.mod_date = moment();
    nowDate = moment().add(30, "days");
  }
  futureDate = moment(doc.mod_date).add(this.plugins[plugins.search].info.cache.listing, "days");
  if (nowDate > futureDate){
    //the cache is expired
    try{
      var listing = yield this.plugins[plugins.search].getListingByID(id);
    }catch (err){
      throw err;
    }
    log.info("Search: Got listing for show (Fresh): " + listing.show_id);
    listing._id = plugins.search + "-" + listing.show_id;
    listing.mod_date = moment();
    if (doc._rev){
      //if there's already a rev, this is an update, not an overwrite
      listing._rev = doc._rev;
    }
    try{
      listing.global_id = globalID;
      listing = yield db.saveDoc(listing, "listings");
    }catch (err){
      throw err;
    }
    log.debug("Search: Saved listing into DB");
  }else{
    //the cache is still fresh
    var listing = doc;
    log.info("Search: Got listing for show (Cached): " + listing.show_id);
  }
  return listing;
});
