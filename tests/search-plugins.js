// This runs through the entire search plugins folder and runs those plugins
// against the same tests.

/* jslint esnext: true */
require('co-mocha');
var chai = require('chai'),
    Promise = require('../helpers/common.js').Promise,
    fs   = Promise.promisifyAll(require('fs'));

var expect = chai.expect;

function fetchPlugins() {
  // This will store our plugins, with the property being the name of the plugin
  // file.
  return fs.readdirAsync(process.cwd()+"/plugins/search").then(function(dir) {
    var plugins = {};
    for(var i=dir.length-1; i >= 0; i--) {
      if(dir[i] !== 'README.md') {
        plugins[dir[i]] = require('../plugins/search/'+dir[i]);
      }
    }

    return new Promise(function(resolve) { resolve(plugins); });
  });
}

// Put your tests in here. I know, it's odd.
function testSuite(plugin, pluginName) {
  describe("Search plugin: "+pluginName, function () {
    it("should have method .searchForShow", function(done) {
      var searchPlugin = new plugin();
      expect(searchPlugin.searchForShow).to.exist();
      done();
    });

    it("should have method .getShowByID", function(done) {
      var searchPlugin = new plugin();
      expect(searchPlugin.getShowByID).to.exist();
      done();
    });

    it("should have method .getListingByID", function(done) {
      var searchPlugin = new plugin();
      expect(searchPlugin.getListingByID).to.exist();
      done();
    });

    it("should return the proper object for .searchForShow", function*(done) {
      var searchPlugin = new plugin();
      var show = yield searchPlugin.searchForShow("Archer");
      expect(show).to.exist;
      expect(show.show_id).to.exist;
      expect(show.name).to.exist;
      expect(show.started).to.exist;

      expect(show.show_id).to.be.a('string');
      expect(show.name).to.be.a('string');
      expect(show.started).to.be.a('string');
      done();
    });

    it("should return the proper object for .getShowByID", function*(done) {
      var searchPlugin = new plugin();
      var show = yield searchPlugin.searchForShow("Archer");
      var showAgain = yield searchPlugin.getShowByID(show.show_id);
      expect(showAgain).to.exist;
      expect(showAgain.show_id).to.exist;
      expect(showAgain.name).to.exist;
      expect(showAgain.started).to.exist;
      expect(showAgain.status).to.exist;
      expect(showAgain.seasons).to.exist;
      expect(showAgain.runtime).to.exist;
      expect(showAgain.showlink).to.exist;

      expect(showAgain.show_id).to.be.a('string');
      expect(showAgain.name).to.be.a('string');
      expect(showAgain.started).to.be.a('string');
      expect(showAgain.status).to.be.a('string');
      expect(showAgain.seasons).to.be.a('number');
      expect(showAgain.runtime).to.be.a('number');
      expect(showAgain.showlink).to.be.a('string');

      done();
    });

    it("should return the proper object for .getListingByID", function*(done) {
      var searchPlugin = new plugin();
      var show = yield searchPlugin.searchForShow("Archer");
      var listing = yield searchPlugin.getListingByID(show.show_id);
      expect(listing).to.exist;
      expect(listing.show_id).to.exist;
      expect(listing.total_episodes).to.exist;
      expect(listing.seasons).to.exist;
      expect(listing.seasons[0]).to.exist;
      expect(listing.seasons[0].season).to.exist;
      expect(listing.seasons[0].episodes).to.exist;
      expect(listing.seasons[0].episodes[0]).to.exist;
      expect(listing.seasons[0].episodes[0].episode_number).to.exist;
      expect(listing.seasons[0].episodes[0].season_number).to.exist;
      expect(listing.seasons[0].episodes[0].air_date).to.exist;
      expect(listing.seasons[0].episodes[0].link).to.exist;
      expect(listing.seasons[0].episodes[0].title).to.exist;

      expect(listing.show_id).to.be.a('string');
      expect(listing.total_episodes).to.be.a('number');
      expect(listing.seasons).to.be.a('object');
      expect(listing.seasons[0]).to.be.a('array');
      expect(listing.seasons[0].season).to.be.a('string');
      expect(listing.seasons[0].episodes).to.be.a('array');
      expect(listing.seasons[0].episodes[0]).to.be.a('object');
      expect(listing.seasons[0].episodes[0].episode_number).to.be.a('number');
      expect(listing.seasons[0].episodes[0].season_number).to.be.a('string');
      expect(listing.seasons[0].episodes[0].air_date).to.be.a('string');
      expect(listing.seasons[0].episodes[0].link).to.be.a('string');
      expect(listing.seasons[0].episodes[0].title).to.be.a('string');

      done();
    });
  });
}

fetchPlugins().then(function(plugins) {
  for (var pluginName in plugins) {
    if (plugins.hasOwnProperty(pluginName)) {
        var plugin = plugins[pluginName];
        testSuite(plugin, pluginName);
    }
  }
});
