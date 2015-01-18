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
