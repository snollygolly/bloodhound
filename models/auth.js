var passport = require('koa-passport'),
    settings = require('./settings'),
    Promise  = require('../helpers/common').Promise,
    config   = require('../config.json');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var domainStr = "http://127.0.0.1:3000";
if(process.env.NODE_ENV == "production") {
  domainStr = "http://bloodhound.tv";
}

// -- Twitta
if(typeof config.app.data.passport_twitter !== "undefined") {
  var TwitterStrategy = require('passport-twitter').Strategy;
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: config.app.data.passport_twitter.consumerKey,
        consumerSecret: config.app.data.passport_twitter.consumerSecret,
        callbackURL: domainStr + '/auth/twitter/callback'
      },
      Promise.coroutine(function * (token, tokenSecret, profile, done) {
        user = yield settings.createUser(profile, "twitter");
        done(null, user);
      })
    )
  );
}

// -- Facebook
if(typeof config.app.data.passport_facebook !== "undefined") {
  var FacebookStrategy = require('passport-facebook').Strategy;
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.app.data.passport_facebook.clientId,
        clientSecret: config.app.data.passport_facebook.clientSecret,
        callbackURL: domainStr + '/auth/facebook/callback',
        enableProof: false
      },
      Promise.coroutine(function * (accessToken, refreshToken, profile, done) {
        user = yield settings.createUser(profile, "facebook");
        done(null, user);
      })
    )
  );
}
