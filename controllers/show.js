var Search = require('../plugins/search.js');
var settings = require("../models/settings");
//logging
var log = require("../plugins/base/common.js").log;
var isInFuture = require("../plugins/base/common.js").isInFuture;

exports.info = function * info() {
  //28764 - Bar Rescue, 37007 - Catch a Contractor, 6207 - The Soup, 18411 - Leverage
  try{
    if (this.isAuthenticated()) {
      var user = yield settings.getUser(this.session.passport.user._id);
    }else{
      var user = settings.mockUser;
    }
    log.info("show.js: getting info for show id: " + this.params.id);
    //history = user.viewing_history[this.params.id];
    var search = new Search();
    show = yield search.getShowByID(this.params.id, user.plugins);
    listing = yield search.getListingByID(this.params.id, user.plugins);
    //loop through each season
    for (var i=0; i<listing.seasons.length; i++) {
      //and every episode in that season
      for (var j=0; j<listing.seasons[i].episodes.length; j++) {
        //if the episode number (int) in the current episode is in the "viewing_history" array, set watched to true
        if (user.viewing_history[this.params.id] && user.viewing_history[this.params.id].indexOf(listing.seasons[i].episodes[j].episode_number) > -1){
          listing.seasons[i].episodes[j].watched = true;
        }else{
          listing.seasons[i].episodes[j].watched = false;
        }
        if (isInFuture(listing.seasons[i].episodes[j].air_date)){
          listing.seasons[i].episodes[j].aired = false;
        }else{
          listing.seasons[i].episodes[j].aired = true;
        }
      }
    }
    show.last_episode = listing.seasons[listing.seasons.length - 1].episodes[listing.seasons[listing.seasons.length - 1].episodes.length - 1];
    //TODO: get the listing and do better comparison of dates for color coding
    //show = yield search.searchForShow("bar rescue");
    yield this.render('show', {user: user, headline: show.name, show: show, listing: listing, scripts: ["show"]});
  }catch (err){
    log.warn("controllers/show.info: " + err);
    this.response.status = 500;
    yield this.render('error', {user: user, error: err});
  }
};
