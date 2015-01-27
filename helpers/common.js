// Plugins to make available everywhere.
exports.Promise = require('bluebird');
exports.request = exports.Promise.promisifyAll(require('request'));
exports.xml2js  = exports.Promise.promisifyAll(require('xml2js'));
exports.moment  = require('moment');

// If we're in a test NODE_ENV, we do not need to see any bunyan logs.
// Also using the stream approach to help with future production logging.
// NOTE: The src property/addition in Bunyan tends to slow these things down in
// heavy traffic environments. Maybe limit this to dev env only?
var streams = [];
if(process.env.NODE_ENV != "test") {
  streams = [{
    stream: process.stdout,
    level: "trace"
  }];
}

var bunyan = require('bunyan');
exports.log = bunyan.createLogger(
{
  name: 'Bloodhound',
  streams: streams,
  src: true,
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res
  }
}
);

// Removes spaces from a string and replaces them with underscores.
exports.removeSpaces = function(data) {
  data = data.split(" ").join("_");
  return data;
};

// Takes all non-word, non-space characters and gets rid of them, and then
// replaces all spaces with underscores via the .removeSpaces function.
exports.formatName = function(data) {
  data = data.replace(/[^\w\s]/gi, '');
  data = exports.removeSpaces(data);
  return data;
};

// Adds a zero to the start of a number that does not have two digits.
exports.padNumber = function(number) {
  var zero = 2 - number.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + number;
};

// Determines whether a date is going to take place after today, or if a date
// has already occurred. Returns a boolean.
exports.isInFuture = function(dateString) {
  var moment = exports.moment,
  now    = exports.moment(),
  then   = moment(dateString, "YYYY-MM-DD");

  return moment(then).isAfter(now);
};

// Determines whether a date is today or not. Returns a boolean.
exports.isToday = function(dateString) {
  var moment = exports.moment,
  now    = moment(),
  then   = moment(dateString, "YYYY-MM-DD");

  if(moment(then).diff(now, 'days') === 0) {
    return true;
  }

  return false;
};
