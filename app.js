// Koa middle ware.
var koa        = require('koa'),
    hbs        = require('koa-hbs'),
    router     = require('koa-router'),
    serve      = require('koa-static-folder'),
    bodyParser = require('koa-bodyparser'),
    session    = require('koa-generic-session'),
    redisStorage = require('koa-redis');

//for passport
require('./models/auth');
var passport = require('koa-passport');

var app = koa();

exports.app      = app;
exports.passport = passport;
exports.hbs      = hbs;

app.use(bodyParser());
app.use(serve('./assets'));

app.use(hbs.middleware({
  viewPath: __dirname + '/views',
  layoutsPath: __dirname + '/views/layouts',
  partialsPath: __dirname + '/views/partials',
  defaultLayout: 'main'
}));

// Passport binding.
var config = require('./config.json');
app.keys = config.app.data.session_keys;

app.use(session({
  cookie: {maxAge: 1000 * 60 * 60 * 24},
  store : redisStorage()
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(router(app));

// Adds response-time to headers.
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

//logging
var log = require("./helpers/common.js").log;

// Let's do some handlebars!
require('./helpers/handlebars');

// Now we bind routes.
require('./routes');

if (process.env.NODE_ENV == "production"){
  port = 80;
} else {
  port = 3000;
}
log.info("Bloodhound is now running on port " + port);
app.listen(port);

process.on('SIGINT', function() {
  process.exit();
});
