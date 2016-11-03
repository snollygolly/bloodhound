//Expose `Plugin`
module.exports = AcquirePlugin;

//Initialize Plugin.

function AcquirePlugin(user) {
  this.info = {};
  this.info.slug = "eztv";
  this.info.name = "EZTV Search";
  this.info.path = "http://eztvtorrent.com/";
  this.info.cache = {
    show: 7
  };
};


//Search prototype

const acquire = AcquirePlugin.prototype;

const common  = require("../../helpers/common.js");
const log = common.log;
const Promise = common.Promise;
const request = common.request;
const cheerio = require('cheerio');

acquire.findShowURLs = Promise.coroutine(function* (show_id, name, episode, ep_name) {
  // replace the underscores with strings, and it seems to match our IDs!
  const searchStr = show_id.split("_").join("-");
  const response = yield request.getAsync(this.info.path + "/" + searchStr).get(0);
  if (response.statusCode != 200){
    throw new Error('Something went wrong at acquire.findShowURLs (' + this.info.slug + ' plugin)');
  }
  $ = cheerio.load(response.body);
  const results = {};
  results.suggestions = [];
  results.results = [];
  //loop through each row
  $(".cat-list").each((i, elem) => {
    // loop through each episode
    $(elem).find("li").each((j, show) => {
      // padded with a bunch of space after
      const showResult = $(show).text().split("   ")[0];
      // check to see if it's a match
      if (showResult === ep_name) {
        const result = {};
        result.link = $(show).find("a").attr("href");
        result.name = ep_name;
        result.meta = {};
        result.meta.size = "Magnet Link";
        result.meta.quality = "480p";
        result.meta.languages = [];
        results.suggestions.push(result);
        return results;
      }
    });
  });
  return results;
});
