/**
 * @module google
 */

"use strict";

const https   = require("https");
const irc     = require("irc-js");
const shared  = require("./shared");

const unescape = shared.unescape;

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
      msg.reply(msg.from.nick + ", sorry, no results for ‟" + query + "”.");
      return;
    }
    msg.reply(person || msg.from.nick + ", " + unescape(hit.titleNoFormatting) + " → " + hit.unescapedUrl);
  });

  return irc.STATUS.STOP;
}

function mdn(msg, query, index, person) {
  const mquery = 'site:developer.mozilla.org ' + query;
  speak(msg, mquery, index, person);
}

function wiki(msg, query, index, person) {
  const wquery = 'site:en.wikipedia.org ' + query;
  speak(msg, wquery, index, person);
}

// Implement Plugin interface.

function load(bot) {
  bot.match(/\bg(?:oogle)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, speak);
  bot.match(/\bm(?:dn)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, mdn);
  bot.match(/\bwiki(?:pedia)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, wiki);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Google";
exports.load    = load;
exports.unload  = unload;
