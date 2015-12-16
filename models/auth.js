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

// -- Reddit
if(typeof config.app.data.passport_reddit !== "undefined") {
  var RedditStrategy = require('passport-reddit').Strategy;
  passport.use(
    new RedditStrategy(
      {
        clientID: config.app.data.passport_reddit.clientId,
        clientSecret: config.app.data.passport_reddit.clientSecret,
        callbackURL: domainStr + '/auth/reddit/callback',
        state: true
      },
      Promise.coroutine(function * (token, tokenSecret, profile, done) {
        profile.displayName = profile.name;
        user = yield settings.createUser(profile, "reddit");
        done(null, user);
      })
    )
  );
}

// -- Github
if(typeof config.app.data.passport_github !== "undefined") {
  var GitHubStrategy = require('passport-github').Strategy;
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.app.data.passport_github.clientId,
        clientSecret: config.app.data.passport_github.clientSecret,
        callbackURL: domainStr + '/auth/github/callback'
      },
      Promise.coroutine(function * (accessToken, refreshToken, profile, done) {
        console.log(profile);
        user = yield settings.createUser(profile, "github");
        done(null, user);
      })
    )
  );
}
