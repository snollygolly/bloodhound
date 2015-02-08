var Promise = require("./common.js").Promise,
    cradle  = Promise.promisifyAll(require('cradle')),
    log  = require("./common.js").log,
    moment  = require("./common.js").moment;

// A custom Error just for database problems.
function CouchDBError(message) {
  this.name = "CouchDBError";
  this.message = (message || "");
}
CouchDBError.prototype = Error.prototype;

// Connects to a database and returns the DB object.
var connectToDatabase = function(dbName) {
  try {
    return new(cradle.Connection)().database(dbName);
  } catch (err) {
    throw new CouchDBError('DB: Get: Connection to database "' + dbName + '" failed');
  }
};

// Grabs a document from a database in CouchDB.
exports.getDoc = Promise.coroutine(function * (id, dbName) {
  try {
    var db = connectToDatabase(dbName);
    var doc = yield db.getAsync(id);
    return doc;
  } catch (err) {
    if(err.name === "CouchDBError") throw err;

    throw new CouchDBError('DB: Get: Get of "' + id + '" failed');
  }
});

// Saves a document in a database in CouchDB.
exports.saveDoc = Promise.coroutine(function * (doc, dbName) {
  try {
    var db = connectToDatabase(dbName);
    var returnVal = yield db.saveAsync(doc._id, doc);

    doc._id = returnVal.id;
    doc._rev = returnVal.rev;
    return doc;
  } catch (err) {
    if(err.name === "CouchDBError") throw err;

    throw new CouchDBError('DB: Save: Save of "' + doc._id + '" failed');
  }
});

// Removes a document in a database in CouchDB.
exports.removeDoc = Promise.coroutine(function * (id, dbName) {
  try {
    var db = connectToDatabase(dbName);
    var returnVal = yield db.removeAsync(id);
    return id;
  } catch (err) {
    if(err.name === "CouchDBError") throw err;
    throw new CouchDBError('DB: Remove: Removal of "' + id + '" failed');
  }
});
