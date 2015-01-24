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
      plugins[dir[i]] = require('../plugins/search/'+dir[i]);
    }

    return new Promise(function(resolve) { resolve(plugins); });
  });
}

// Put your tests in here. I know, it's odd.
function testSuite(plugin, pluginName) {
  describe("Search plugin: "+pluginName, function () {
    plugin = new plugin();
    it("should have method .searchForShow", function(done) {
      expect(plugin.searchForShow()).to.exist;
      done();
    });

    it("should have method .getShowByID", function(done) {
      expect(plugin.getShowByID()).to.exist;
      done();
    });

    it("should have method .getListingByID", function(done){
      expect(plugin.getListingByID()).to.exist;
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
