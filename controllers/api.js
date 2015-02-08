var settings = require("../models/settings");
//logging
var log = require("../helpers/common.js").log;


exports.toggleWatch = function * toggleWatch() {
  try{
    this.type = "application/json";
    var bodyObj = {};
    if (!this.request.body.show_id){
      throw new Error("No show_id specified");
    }
    else if (!this.request.body.episode_number){
      throw new Error("No episode_number specified");
    }
    else{
      if (this.isAuthenticated()) {
        var user = yield settings.getUser(this.session.passport.user._id);
        if (!user.viewing_history[this.request.body.show_id]){
          //they don't have any viewings for this show
          user.viewing_history[this.request.body.show_id] = [];
        }
        //check to see if they're sending an array
        var epArr = this.request.body.episode_number;
        if (Array.isArray(epArr) === true){
          //they've passed in an array of episode numbers, so check them all
          for (var i=0; i<epArr.length; i++) {
            index = user.viewing_history[this.request.body.show_id].indexOf(parseInt(epArr[i]));
            if (index === -1){
              user.viewing_history[this.request.body.show_id].push(parseInt(epArr[i]));
            }
          }
          bodyObj.watched = 1;
          bodyObj.method = "BATCH";
        }else{
          //if they aren't sending an array, they are sending a single episode
          var index = user.viewing_history[this.request.body.show_id].indexOf(parseInt(this.request.body.episode_number));
          if (index > -1){
            //they have already seen this show, remove it
            user.viewing_history[this.request.body.show_id].splice(index, 1);
            bodyObj.watched = 0;
          }else{
            user.viewing_history[this.request.body.show_id].push(parseInt(this.request.body.episode_number));
            bodyObj.watched = 1;
          }
          bodyObj.method = "SINGLE";
        }
        user = yield settings.saveUser(user);
        bodyObj.show_id = this.request.body.show_id;
        bodyObj.episode_number = this.request.body.episode_number;
      }else{
        throw new Error("No logged in user");
      }
    }
    this.body = JSON.stringify(bodyObj);
  }catch (err){
    log.warn("controllers/api.toggleWatch: " + err);
    bodyObj.error = err.toString();
    this.body = JSON.stringify(bodyObj);
  }

}

exports.addShowByName = function * addShowByName() {
  var Search = require("../plugins/search.js");
  var search = new Search();
  try{
    this.type = "application/json";
    var bodyObj = {};
    if (!this.request.body.show){
      throw new Error("No show specified");
    }
    else{
      if (this.isAuthenticated()) {
        var user = yield settings.getUser(this.session.passport.user._id);
        //search for the show
        bodyObj.show = yield search.searchForShow(this.request.body.show, user.plugins);
        if (bodyObj.show.global_id){
          //we actually found the show
          if (user.collection.indexOf(bodyObj.show.global_id) !== -1){
            //they already have the show in their colleciton, let's not add it again
            throw new Error("This show is already in your collection");
          }
          user.collection.push(bodyObj.show.global_id);
          user.viewing_history[bodyObj.show.global_id] = [];
          user = yield settings.saveUser(user);
          bodyObj.user = {};
          bodyObj.user.added = true;
        }else{
          bodyObj.user.added = false;
        }
      }else{
        throw new Error("No logged in user");
      }
    }
    this.body = JSON.stringify(bodyObj);
  }catch (err){
    log.warn("controllers/api.addShowByName: " + err);
    bodyObj.error = err.toString();
    this.body = JSON.stringify(bodyObj);
    this.response.status = 500;
  }
}

exports.removeShow = function * removeShow() {
  try{
    this.type = "application/json";
    var bodyObj = {};
    if (!this.request.body.show_id){
      throw new Error("No show specified");
    }
    else{
      if (this.isAuthenticated()) {
        var user = yield settings.getUser(this.session.passport.user._id);
        var index = user.collection.indexOf(this.request.body.show_id);
        if (index === -1){
          //they already have the show in their colleciton, let's not add it again
          throw new Error("This show isnt in your collection");
        }
        user.collection.splice(index, 1);
        delete user.viewing_history[this.request.body.show_id];
        user = yield settings.saveUser(user);
        bodyObj.status = "OK";
      }else{
        throw new Error("No logged in user");
      }
    }
    this.body = JSON.stringify(bodyObj);
  }catch (err){
    log.warn("controllers/api.removeShow: " + err);
    bodyObj.error = err.toString();
    this.body = JSON.stringify(bodyObj);
    this.response.status = 500;
  }
}

exports.findShowURLs = function * findShowURLs() {
  var Acquire = require("../plugins/acquire.js");
  if (this.isAuthenticated()) {
    // However, if a user is authenticated, we grab that user's information
    // using their passport session information.
    var user = yield settings.getUser(this.session.passport.user._id);
    var acquire = new Acquire(user);
  }else{
    throw new Error("No logged in user");
  }
  try{
    this.type = "application/json";
    bodyObj = {};
    if (!this.query.provider){
      throw new Error("No provider specified");
    }
    if (!this.query.episode){
      throw new Error("No episode specified");
    }
    if (!this.query.ep_name){
      var ep_name = null;
    }else{
      var ep_name = this.query.ep_name;
    }
    var show_id = this.query.episode.split("_");
    var episode_id = show_id.pop();
    show_id = show_id.join("_");
    var results = yield acquire.findShowURLs(show_id, episode_id, ep_name, this.query.provider);
    bodyObj.results = results;
    bodyObj.status = "OK";
    this.body = JSON.stringify(bodyObj);
  }catch (err){
    log.warn("controllers/api.findShowURLs: " + err);
    bodyObj.error = err.toString();
    this.body = JSON.stringify(bodyObj);
    this.response.status = 500;
  }
}

exports.flushCache = function * flushCache() {
  var db = require("../helpers/db.js");
  var validDBs = ["downloads", "shows", "listings"];
  try{
    this.type = "application/json";
    var bodyObj = {};
    if (!this.request.body.id){
      throw new Error("No ID specified");
    }
    if (!this.request.body.db){
      throw new Error("No DB specified");
    }
    if (!this.request.body.plugin){
      throw new Error("No Plugin specified");
    }
    //no one should be flushing caches outside of validDBs, this is suspect
    if (validDBs.indexOf(this.request.body.db) === -1){
      throw new Error("Invalid DB specified");
    }
    if (this.isAuthenticated()) {
      //first, get the index for this show
      var doc = yield db.getDoc(this.request.body.id, "index");
      log.warn("doc:", doc);
      if (!doc.plugin[this.request.body.plugin]){
        throw new Error("No index for this show");
      }
      var id = this.request.body.plugin + "-" + doc.plugin[this.request.body.plugin];
      //now delete the plugin specific file for this
      bodyObj.id = yield db.removeDoc(id, this.request.body.db);
    }else{
      throw new Error("No logged in user");
    }
    this.body = JSON.stringify(bodyObj);
  }catch (err){
    log.warn("controllers/api.addShowByName: " + err);
    bodyObj.error = err.toString();
    this.body = JSON.stringify(bodyObj);
    this.response.status = 500;
  }
}
