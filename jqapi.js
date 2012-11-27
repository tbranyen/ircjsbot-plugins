/** @module jqapi */

"use strict";

const fmt     = require("util").format;
const https   = require("https");
const irc     = require("irc-js");
const shared  = require("./shared");
const jQJSON  = require("./jqapi.json");
const log     = irc.logger.get("ircjs-plugin-jqapi");

function onAPI(msg, query, index, nick) {
  log.debug("in onAPI")
  const results = [];
  const num     = index ? index : 1;
  const replyTo = nick || msg.from.nick;
  let hits = 0;
  for (let key in jQJSON) {
    let name  = jQJSON[key].name;
    let title = jQJSON[key].title;
    let desc  = jQJSON[key].desc;
    let url   = jQJSON[key].url;
    // search for selector
    if (-1 !== query.indexOf(":") &&
        title.indexOf("Selector") >= 0 &&
        name === query.replace(":", "")) {
      results.push(fmt("%s: %s %s", title, desc, url));
      ++hits;
    }
    // everything else
    else if (name.toLowerCase() === query.toLowerCase() &&
        title.indexOf(":") === -1) {
      results.push(fmt("%s: %s %s", title, desc, url));
      ++hits;
    }
    if (hits === num) {
      break;
    }
  }
  if (hits) {
    if (index && hits < index) {
      msg.reply("%s, I only found %d match%s.", replyTo, hits, hits === 1 ? "" : "es");
    }
    else {
      msg.reply("%s, %s", replyTo, results.pop());
    }
  }
  else {
    msg.reply("%s, no matches.", replyTo);
  }
  return irc.STATUS.STOP;
}

function load(client) {
  client.match(/\bapi\s+(\S+)(?:\s*([1-9]+))?(?:\s*@\s*(\S+)[\s\W]*)?$/,
    shared.forMe, onAPI);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "jQuery API";
exports.load    = load;
exports.unload  = unload;
