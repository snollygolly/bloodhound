var passport = require('koa-passport');
var settings = require('./settings');
var Promise = require('../helpers/common').Promise;
var config = require('../config.json');

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

if (process.env.NODE_ENV == "production"){
  var domainStr = "http://bloodhound.tv";
}else{
  var domainStr = "http://127.0.0.1:3000";
}

var TwitterStrategy = require('passport-twitter').Strategy
passport.use(new TwitterStrategy({
  consumerKey: config.app.data.passport_twitter.consumerKey,
  consumerSecret: config.app.data.passport_twitter.consumerSecret,
  callbackURL: domainStr + '/auth/twitter/callback'
},
Promise.coroutine(function * (token, tokenSecret, profile, done) {
  user = yield settings.createUser(profile, "twitter");
  done(null, user);
})

))
