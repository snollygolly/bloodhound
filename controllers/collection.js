var Search = require('../plugins/search.js');
var settings = require('../models/settings');
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
      show.last_episode = listing.seasons.pop().episodes.pop();
      //TODO: get the listing and do better comparison of dates for color coding
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
