var app      = require("./app").app,
    passport = require("./app").passport;

// controllers
var collection = require('./controllers/collection'),
    show       = require('./controllers/show'),
    settings   = require('./controllers/settings'),
    api        = require('./controllers/api');

// models
var settingsModel = require('./models/settings');

//config
var config = require('./config.json');

// Handles user assignment based on authentication.
app.get('/', function *() {
  // We assign settings to mockUser to start.
  var user = settingsModel.mockUser;

  if (this.isAuthenticated()) {
    // However, if a user is authenticated, we grab that user's information
    // using their passport session information.
    user = yield settingsModel.getUser(this.session.passport.user._id);
  }

  // Finally, we send them off to rendering.
  yield this.render('index', {
    user: user,
    title: "BloodHound",
    content: "Index"
  });
});

// Authentication/Passport bindings.
//-- Twitter
app.get("/auth/twitter",
  passport.authenticate("twitter")
);

app.get("/auth/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: "/collection",
    failureRedirect: "/"
  })
);

//-- Facebook
app.get("/auth/facebook",
  passport.authenticate("facebook")
);

app.get("/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/collection",
    failureRedirect: "/"
  })
);

//-- GitHub
app.get("/auth/github",
passport.authenticate("github")
);

app.get("/auth/github/callback",
passport.authenticate("github", {
  successRedirect: "/collection",
  failureRedirect: "/"
})
);


// Collections.
app.get("/collection", collection.index);
app.get("/collection/manage", collection.manage);


// Shows.
app.get("/show/:id", show.info);


// Settings
app.get("/settings", settings.index);

// Login
app.get('/login', function *() {
  if (this.isAuthenticated()) {
    // However, if a user is authenticated, we grab that user's information
    // using their passport session information.
    user = yield settingsModel.getUser(this.session.passport.user._id);
    yield this.render('index', {
      user: user,
      title: "BloodHound",
      content: "Index"
    });
  }else{
    yield this.render('login');
  }
});

app.get('/admin', function *() {
  if (this.isAuthenticated()) {
    // However, if a user is authenticated, we grab that user's information
    // using their passport session information.
    user = yield settingsModel.getUser(this.session.passport.user._id);
    if (user.admin === true){
      yield this.render('admin', {
        config: JSON.stringify(config, undefined, 2)
      });
    }else{
      yield this.render('index', {
        user: user,
        title: "BloodHound",
        content: "Index"
      });
    }
  }else{
    yield this.render('login');
  }
});


// API posts.
app.post("/api/toggleWatch", api.toggleWatch);
app.post("/api/addShowByName", api.addShowByName);
app.post("/api/removeShow", api.removeShow);
