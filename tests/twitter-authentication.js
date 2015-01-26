/* jslint esnext: true */
require('co-mocha');

chai = require('chai');

app  = require('../app').app;

api = require('co-supertest').agent(app.listen());

describe("Twitter authentication", function() {
  it("should redirect to twitter properly", function*() {
    yield api
      .get('/auth/twitter')
      .expect(302)
      .expect('Location', /^https:\/\/api\.twitter\.com\/oauth\/authenticate\?oauth_token=[A-Za-z0-9]+$/)
      .end();
  });
});
