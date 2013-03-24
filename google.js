/**
 * @module google
 */

"use strict";

const https   = require("https");
const irc     = require("irc-js");
const shared  = require("./shared");

const unescape = shared.unescape;

const sites = [
    [ "mdn",     "developer.mozilla.org " ]
  , [ "wiki",    "en.wikipedia.org " ]
  , [ "imdb",    "www.imdb.com " ]
  , [ "reddit",  "www.reddit.com " ]
  , [ "hn",      "news.ycombinator.com " ]
  , [ "youtube", "www.youtube.com " ]
]

function search(query, cb) {
  const url = {
    host: "ajax.googleapis.com",
    path: "/ajax/services/search/web?v=1.0&q=" + encodeURIComponent(query)
  };
  https.get(url, function(res) {
    const data = [];
    res.on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data));
    res.on(irc.NODE.SOCKET.EVENT.END, function() {
      cb(JSON.parse(data.join("")).responseData.results);
    });
  });
}

function speak(msg, query, index, person) {
  const idx = index ? index : 0;
  search(query, function(res) {
    let hit = res[idx];
    if (!hit) {
      msg.reply("Sorry, no results for ‟" + query + "”.");
      return;
    }
    msg.reply(unescape(hit.titleNoFormatting) + " → " + hit.unescapedUrl);
  });

  return irc.STATUS.STOP;
}

function siteSearch(site, msg, query, index, person) {
  speak(msg, site + query, index, person);
}

// Implement Plugin interface.

function load(bot) {
  bot.register("google", /(.+)/, speak);
  bot.register("g", /(.+)/, speak);

  sites.forEach(function(s) {
    bot.register(s[0], /(.+)/, siteSearch.bind(null, s[1]));
  });
  
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Google";
exports.help    = "Get the first result from Google with \"google [term]\" or \"g [term]\".";
exports.load    = load;
exports.unload  = unload;
