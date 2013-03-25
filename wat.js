/** @module wat */

"use strict";

const fmt     = require("util").format;
const irc     = require("irc-js");
const shared  = require("./shared");

const log     = irc.logger.get("ircjs-plugin-wat");
const watURL  = { host: "raw.github.com", path: "/gf3/WAT/master/wat.json" };
const sKey    = "WAT";

const redisClient = shared.redis.client;

const blacklist = new Set();

blacklist.add('#jquery');
blacklist.add('#xbmc');
blacklist.add('#openelec');

function onWat(msg) {
  if ( shared.stfu( msg, blacklist ) ) return;
  redisClient.srandmember(sKey, function(err, res) {
    if (err) {
      log.error("onWat error: %s", err);
      return;
    }
    if (res) {
      msg.reply(res);
    }
  });
  return irc.STATUS.STOP;
}

function load(bot) {
  shared.getJSON(watURL, function(data) {
    log.debug("Got wat JSON: %s thingies", data.length);
    redisClient.sadd(sKey, data);
  });
  bot.match(/^:w[au]t\W*$/i, onWat);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Wat!";
exports.load    = load;
exports.unload  = unload;
