//plugins to make available everywhere
exports.Promise = require('bluebird');
exports.request = exports.Promise.promisifyAll(require('request'));
exports.xml2js = exports.Promise.promisifyAll(require('xml2js'));
exports.moment = require('moment');
exports.log = require('bunyan').createLogger({name: 'Bloodhound', level: 'info', src: true});

exports.removeSpaces = function(data) {
  data = data.split(" ").join("_");
  return data;
};

exports.formatName = function(data) {
  data = data.replace(/[^\w\s]/gi, '');
  data = exports.removeSpaces(data);
  return data;
}

exports.padNumber = function(number) {
  var zero = 2 - number.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + number;
}

exports.isInFuture = function(dateString) {
  var moment = exports.moment;
  var now = exports.moment();
  var then = moment(dateString, "YYYY-MM-DD");
  return moment(then).isAfter(now);
}

exports.isToday = function(dateString) {
  var moment = exports.moment;
  var now = moment();
  var then = moment(dateString, "YYYY-MM-DD");
  if (moment(then).diff(now, 'days') === 0){
    return true;
  }
  return false;
}
