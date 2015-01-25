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
      expect(show.show_id).to.exist;
      expect(show.name).to.exist;
      expect(show.started).to.exist;

      expect(show.show_id).to.be.a('string');
      expect(show.name).to.be.a('string');
      expect(show.started).to.be.a('string');
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
