/* jslint esnext: true */
require('co-mocha');
chai = require('chai');

app  = require('../app').app;

api = require('co-supertest').agent(app.listen());

describe("Unauthenticated users", function() {
  it("should get a 200 from the index page", function*() {
    yield api.get('/').expect(200).end();
  });

  it("should get a 200 from the collections page", function*() {
    yield api.get('/collection').expect(200).end();
  });
});
