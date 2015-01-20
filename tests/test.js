chai = require('chai');

app  = require('../app');

api = require('co-supertest').agent(app.listen());

describe("Test test", function() {
  it("should get a 200 from the index page", function*() {
    yield api.get('/').expect(200).end();
  });
});
