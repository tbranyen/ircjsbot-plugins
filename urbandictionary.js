/**
 * @module urbandictionary
 */

"use strict";

const fmt     = require("util").format;
const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-domains");

function onUrbandictionary(msg, query, index, nick) {
  const q = query.replace(/ /g,"+")
    , replyTo = nick || msg.from.nick
    , url = {
        host: "api.urbandictionary.com",
        path: "/v0/define?term=" + encodeURI(query)
      };

  http.get(url, function(res) {
    const data = [];
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data))
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        
        const j = JSON.parse(data.join(""));
        
        if (j.result_type == "no_results") {
          msg.reply("Nothing found for \x02" + query + "\x02");
          return;
        }

        var result = j.list[0],
            reply = "\x02" + result.word + "\x02: " + result.definition + " — " + result.example;
        msg.reply(reply);

      });

  return irc.STATUS.STOP;
  });
}

function load(bot) {
  bot.match(/\bud\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, onUrbandictionary);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "urbandictionary";
exports.load    = load;
exports.unload  = unload;