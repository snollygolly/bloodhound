var settings = require("../models/settings");
var config = require('../config.json');
//logging
var log = require("../plugins/base/common.js").log;

exports.index = function * index() {
  try{
    if (this.isAuthenticated()) {
      var user = yield settings.getUser(this.session.passport.user._id);
    }else{
      throw new Error('You must be logged in to manage your settings');
    }
    yield this.render('settings', {user: user, headline: "My Settings", config: config, user: user});
  }catch (err){
    log.warn("controllers/settings.index: " + err);
    this.response.status = 500;
    yield this.render('error', {user: user, error: err});
  }
};
