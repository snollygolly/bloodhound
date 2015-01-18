var Search = require('../plugins/search.js');
var settings = require('../models/settings');
var moment = require("../plugins/base/common.js").moment;
//logging
var log = require("../plugins/base/common.js").log;

exports.index = function * index() {
  //try{
    if (this.isAuthenticated()) {
      var user = yield settings.getUser(this.session.passport.user._id);
    }else{
      var user = settings.mockUser;
    }
    var shows = [];
    var search = new Search();
    for (var i=0; i<user.collection.length; i++) {
      show = yield search.getShowByID(user.collection[i], user.plugins);
      listing = yield search.getListingByID(user.collection[i], user.plugins);
      //set the color style for this row
      prunedListing = pruneFutureShows(listing);
      show.last_episode = prunedListing.seasons[prunedListing.seasons.length - 1].episodes.pop();
      show.color = getColor(show, prunedListing, user);
      //add show to the collection
      shows.push(show);
    }
    yield this.render('collection', {user: user, headline: "My Collection", shows: shows});
  //}catch (err){
  //  log.warn("controllers/collection.index: " + err);
  //  yield this.render('error', {user: user, error: err});
  //}
};

exports.manage = function * manage() {
  try{
    if (this.isAuthenticated()) {
      var user = yield settings.getUser(this.session.passport.user._id);
    }else{
      throw new Error('You must be logged in to manage your collection');
    }
    var shows = [];
    var search = new Search();
    for (var i=0; i<user.collection.length; i++) {
      show = yield search.getShowByID(user.collection[i], user.plugins);
      shows.push(show);
    }
    yield this.render('collection_manage', {user: user, headline: "Manage My Collection", shows: shows, scripts: ["collection"]});
  }catch (err){
    log.warn("controllers/collection.index: " + err);
    this.response.status = 500;
    yield this.render('error', {user: user, error: err});
  }
  //show = yield search.searchForShow("bar rescue");
};

function getColor (show, listing, user){
  var colors = {
    red: "danger",
    green: "success",
    yellow: "warning",
    blue: "info",
    grey: "default"
  };
  var color;
  //get rid of any future shows from the listing for comparisons
  //pass it the show, listing, and user, and it decides what the color code is depending on logic here
  if (!user.viewing_history[show.global_id]){
    //they don't have a viewing history for this show, let's mock one up
    user.viewing_history[show.global_id] = [];
  }
  if (user.viewing_history[show.global_id].length >= listing.watchable_episodes){
    //they've seen them all
    if (show.status == "DEAD"){
      return colors.red;
    }
    if (show.status == "LIVE"){
      return colors.yellow;
    }
  }
  //get the last non-future episode
  if (user.viewing_history[show.global_id].length == listing.watchable_episodes - 1 && isToday(show.last_episode.air_date)){
    return colors.blue;
  }
  if (user.viewing_history[show.global_id].length < listing.watchable_episodes){
    return colors.green;
  }
  //something went wrong
  return colors.grey;
}

function pruneFutureShows (listing){
  //pass it in a listing and it passes that listing to you back without episodes in the future
  var currentSeason = listing.seasons.pop();
  listing.watchable_episodes = listing.total_episodes;
  //we're only checking the latest season, that should be good enough
  for (var i=0; i<currentSeason.episodes.length; i++) {
    if (isInFuture(currentSeason.episodes[i].air_date)){
      currentSeason.episodes.splice(i, 1);
      //take one from the count to make it all match up
      listing.watchable_episodes--;
    }
  }
  listing.seasons.push(currentSeason);
  return listing;
}

function isInFuture(dateString) {
  var now = moment();
  var then = moment(dateString, "YYYY-MM-DD");
  return moment(then).isAfter(now);
}

function isToday(dateString) {
  var now = moment();
  var then = moment(dateString, "YYYY-MM-DD");
  if (moment(then).diff(now, 'days') === 0){
    return true;
  }
  return false;
}
