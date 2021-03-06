var db = require("../helpers/db.js");
var common = require("../helpers/common.js");
var log = common.log;
var Promise = common.Promise;

exports.getUser = Promise.coroutine(function * (id) {
  try {
    doc = yield db.getDoc(id, "users");
  }
  catch (err) {
    log.info('No user by that ID (' + id + ')');
    throw new Error('No user by that ID (' + id + ')');
  }
  return doc;
});

exports.saveUser = Promise.coroutine(function * (doc) {
  try {
    doc = yield db.saveDoc(doc, "users");
  }
  catch (err) {
    log.warn('Problem saving user with ID (' + doc._id + ')');
    throw new Error('Problem saving user with ID (' + doc._id + ')');
  }
  return doc;
});

exports.checkUser = Promise.coroutine(function * (id) {
  try {
    doc = yield exports.getUser(id);
    return doc;
  }
  catch (err) {
    return false;
  }
});

exports.createUser = Promise.coroutine(function * (profile, strategy) {
  //if it doesn't need to be created, send them the user
  doc = yield exports.checkUser(strategy + "_" + profile.id);
  if (doc === false){
    doc = {
      _id: strategy + "_" + profile.id,
      nickname: profile.displayName,
      strategy: strategy,
      plugins: {
        search: "guidebox",
        acquire: ["itunes"]
      },
      collection: [],
      viewing_history: {}
    };
    try {
      doc = yield exports.saveUser(doc);
    }
    catch (err) {
      log.info('Problem saving user with ID (' + strategy + "_" + profile.id + ')');
      throw new Error('Problem saving user with ID (' + strategy + "_" + profile.id + ')');
    }
  }
  return doc;
});

exports.mockUser = {
  nickname: false,
  plugins: {
    search: "guidebox",
    acquire: ["itunes"]
  },
  collection: ["archer_2009"],
  viewing_history: {
    "archer_2009": []
  }
};
