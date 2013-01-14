/**
 * @module convert
 */

"use strict";

const fmt     = require("util").format;
const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-convert");

function onConvert(msg, query, index, nick) {
  const q =  query.split(/in|to/);
  const replyTo = nick || msg.from.nick;
  const url = {
    host: "www.google.com",
    path: "/ig/calculator?hl=en&q=" + encodeURI(query)
  };

  http.get(url, function(res) {
    const data = [];
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data))
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        const j = JSON.parse(
          data
            .join("")
            .replace(/(['"])?([a-zA-Z0-9]+)(['"])?:/g, '"$2":'));

        if (j.error) {
          msg.reply("Error converting...");
        }
        else {
          var response = j.lhs + " \x02=\x02 " + j.rhs;
          msg.reply(response);
        }
      });

    return irc.STATUS.STOP;
  });
}

function load(bot) {
  bot.match(/^:[!,./\?@`]calc(?:ulate)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i, onConvert);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "convert";
exports.load    = load;
exports.unload  = unload;
