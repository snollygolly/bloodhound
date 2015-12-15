var Search = require('../plugins/search.js');
var settings = require("../models/settings");
//logging
var log = require("../helpers/common.js").log;
var isInFuture = require("../helpers/common.js").isInFuture;

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
    var show = yield search.getShowByID(this.params.id, user.plugins);
    var listing = yield search.getListingByID(this.params.id, user.plugins);
    var formattedSeasonNum = this.params.episode.split("E")[0].split("S").join("");
    var seasonNum = parseInt(formattedSeasonNum);
    var epNum = this.params.episode.split("E")[1];
    for (var j=0; j<listing.seasons[seasonNum-1].episodes.length; j++) {
      //loop through all episodes in this season
      if (listing.seasons[seasonNum-1].episodes[j].season_number == epNum){
        //find the one that matches the season_number
        var episode = listing.seasons[seasonNum-1].episodes[j];
        episode.season = formattedSeasonNum;
        episode.global_id = show.global_id + "_" + this.params.episode;
        episode.formatted_link_domain = episode.link.split("/")[2];
        episode.link_domain = episode.link.split("/").slice(0,3).join("/");
        episode.mod_date = show.mod_date;
        break;
      }
    }
    yield this.render('episode', {user: user, show: show, episode: episode, plugins: user.plugins.acquire});
  }catch (err){
    log.warn("controllers/show.info: " + err);
    this.response.status = 500;
    yield this.render('error', {user: user, error: err});
  }
};
