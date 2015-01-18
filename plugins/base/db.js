var Promise = require("./common.js").Promise;
var cradle = Promise.promisifyAll(require('cradle'));
var moment = require("./common.js").moment;

exports.getDoc = Promise.coroutine(function * (id, dbName) {
  try{
    var db = new(cradle.Connection)().database(dbName);
  }catch (err) {
    throw new Error('DB: Get: Connection to database "' + dbName + '" failed');
  }
  try{
    doc = yield db.getAsync(id);
  }catch (err) {
    throw new Error('DB: Get: Get of "' + id + '" failed');
  }
  return doc;
});

exports.saveDoc = Promise.coroutine(function * (doc, dbName) {
  try{
    var db = new(cradle.Connection)().database(dbName);
  }catch (err) {
    throw new Error('DB: Save: Connection to database "' + dbName + '" failed');
  }
  try{
    returnVal = yield db.saveAsync(doc._id, doc);
  }catch (err) {
    throw new Error('DB: Save: Save of "' + doc._id + '" failed');
  }
  doc._id = returnVal.id;
  doc._rev = returnVal.rev;
  return doc;
});
