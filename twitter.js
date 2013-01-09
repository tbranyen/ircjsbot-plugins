"use strict";

const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-twitter");

const host    = "api.twitter.com";

function outputStatus(msg, data) {
  if (data.text && data.user) {
    let name = shared.unescape(data.user.screen_name || data.user.name);
    let tweet = shared.unescape(data.text);
    msg.reply("%s, @%s: %s", msg.from.nick, name, tweet);
  } else {
    log.debug("Tweet status didn't contain the necessary info:", data);
  }
}

function status(msg, type, statusId) {
  log.debug("Fetching tweet status: %s", statusId);
  const url = { hostname: host, path: "/1/statuses/show.json?id=" + statusId };
  shared.getJSON(url, outputStatus.bind(null, msg));
}

function load(bot) {
  bot.match(/twitter\.com\/(?:#!\/)?(.+?)\/status(?:es)?\/(\d+)/i, status);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Twitter";
exports.load    = load;
exports.unload  = unload;
