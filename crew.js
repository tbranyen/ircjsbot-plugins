/** @module crew */

"use strict";

const fmt     = require("util").format;
const https   = require("https");
const irc     = require("irc-js");
const shared  = require("./shared");

const log     = irc.logger.get("ircjs-plugin-crew");
const crewKey = "CREW";
const crewURL = {
  host: "raw.github.com",
  path: "/ot-crew/ot-crew.com/master/public/crew.json"
};

const redisClient = shared.redis.client;

function prettyPrint(data) {
  const ret = [];
  for (let k in data) {
    if (data.hasOwnProperty(k) && k !== "imgUrl") {
      ret.push(k, "→", data[k], "•");
    }
  }
  ret.pop();
  return ret.join(" ");
}

// Looks for ?f(inger) <name>, replies with crew data.
function onFinger(msg, nick) {
  redisClient.hget(crewKey, irc.id(nick), function(err, res) {
    if (err) {
      log.error("Error getting crüe data: %s", err);
      return irc.STATUS.ERROR;
    }
    if (!res) {
      msg.reply("No idea who %s is.", nick);
      return;
    }
    var data = JSON.parse(res);
    if (data.imgUrl && data.imgUrl !== "") {
      msg.reply(data.imgUrl)
    }
    msg.reply(prettyPrint(data));
  });
  return irc.STATUS.STOP;
}

function load(bot) {
  shared.getJSON(crewURL, function(data) {
    const headCount = data.length;
    log.debug("Got crew data:", data);
    // Now convert from array of objects to object keyed on nick/id
    // because then we can shove it straight into redis with hmset.
    const redisData = {};
    data.forEach(function(crewMember) {
      redisData[irc.id(crewMember.irc)] = JSON.stringify(crewMember);
    });
    redisClient.hmset(crewKey, redisData);
  });

  bot.match(/^:(?:\S+)?\W?\bf(?:inger)?\s+(\S+)/i, shared.forMe, onFinger);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Crew";
exports.load    = load;
exports.unload  = unload;
