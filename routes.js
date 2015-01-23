var app      = require("./app").app,
    passport = require("./app").passport;

// controllers
var collection = require('./controllers/collection'),
    show       = require('./controllers/show'),
    settings   = require('./controllers/settings'),
    api        = require('./controllers/api');

// models
var settingsModel = require('./models/settings');

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


// Collections.
app.get("/collection", collection.index);
app.get("/collection/manage", collection.manage);


// Shows.
app.get("/show/:id", show.info);


// Settings
// Question: @snollygolly : Why is the settings route interacting directly with
// a model?
app.get("/settings", settings.index);


// API posts.
app.post("/api/toggleWatch", api.toggleWatch);
app.post("/api/addShowByName", api.addShowByName);
app.post("/api/removeShow", api.removeShow);
