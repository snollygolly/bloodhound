var koa     = require('koa');
var hbs     = require('koa-hbs');
var router  = require('koa-router');
var serve   = require('koa-static-folder');
var bodyParser = require('koa-bodyparser');
//for passport
require('./models/auth');
var passport = require('koa-passport');
var session = require('koa-generic-session');

var app = koa();
app.use(bodyParser());
app.use(serve('./assets'));

app.use(hbs.middleware({
  viewPath: __dirname + '/views',
  layoutsPath: __dirname + '/views/layouts',
  partialsPath: __dirname + '/views/partials',
  defaultLayout: 'main'
}));

var config = require('./config.json');
app.keys = config.app.data.session_keys;

app.use(session());
app.use(passport.initialize());
app.use(passport.session());
app.use(router(app));


hbs.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
    return opts.fn(this);
  else
    return opts.inverse(this);
});

var requestTime = function(headerName){
  return function *(next){
    var start = new Date();
    yield next;
    var end = new Date();
    var ms = end - start;
    this.set(headerName, ms + "ms");
  }
}

app.use(requestTime('Reponse-time'));

//controllers
var collection = require('./controllers/collection');
var show = require('./controllers/show');
var settings = require('./controllers/settings');
var api = require('./controllers/api');

//model
var settingsModel = require('./models/settings');

//logging
var log = require("./plugins/base/common.js").log;

app.get('/', function *(){
  if (this.isAuthenticated()) {
    var user = yield settingsModel.getUser(this.session.passport.user._id);
  }else{
    var user = settingsModel.mockUser;
  }
  yield this.render('index', {user: user, title: "BloodHound", content: "Index"});
});

app.get('/auth/twitter',
passport.authenticate('twitter')
)

app.get('/auth/twitter/callback',
passport.authenticate('twitter', {
  successRedirect: '/collection',
  failureRedirect: '/'
})
)

app.get('/collection', collection.index);
app.get('/collection/manage', collection.manage);

app.get('/show/:id', show.info);

app.get('/settings', settings.index);

app.post('/api/toggleWatch', api.toggleWatch);
app.post('/api/addShowByName', api.addShowByName);
app.post('/api/removeShow', api.removeShow);
app.get('/api/findShowURLs', api.findShowURLs);

if (process.env.NODE_ENV == "production"){
  port = 80;
}else{
  port = 3000;
}
log.info("Bloodhound is now running on port " + port);
app.listen(port);
