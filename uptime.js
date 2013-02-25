/**
 * @module uptime
 */

"use strict";

const https   = require("https");
const irc     = require("irc-js");
const shared  = require("./shared");

const responses = [
  "%s since last callbac-cident.",
  "Sober for %s.",
  "I became self-aware %s ago."
];

function uptime(msg) {
  const ago = shared.timeAgo(Date.now() - process.uptime() * 1000);
  const index = Math.floor(responses.length * Math.random()); 
  msg.reply(responses[index], ago.join(" "));
}

function load(bot) {
  bot.match(/^:[!,./\?@`]up(?:time)?\s*$/, uptime);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Uptime";
exports.load    = load;
exports.unload  = unload;
