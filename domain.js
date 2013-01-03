/**
 * @module domain
 */

"use strict";

const fmt     = require("util").format;
const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-domains");
const request = require('request'); 


function onDomain(msg, query, index, nick) {
  
  const q = query.replace(/ /g,"+")
    , replyTo = nick || msg.from.nick
    , url = {
        host: "domai.nr",
        path: "/api/json/search?q="+encodeURIComponent(query)
      };

  http.get(url, function(res) {
    const data = [];
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data))
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        
        const j = JSON.parse(data.join(""));

        if(j.error || !j.results.length){
          msg.reply("Nothing found...");
          return;
        }

        // display the first result
        var domain = j.results[0],
            response = "\x02" + domain.domain + "\x02 - ";

        
        switch(domain.availability) {
          case "taken" :
            response+= "\x034\u2639 TAKEN\x03";
            break;
          case "available" :
            response+= "\x039☺ AVAILABLE\x03";
            break;
          case "maybe" :
            response+= "\x038\u2639☺ MAYBE!\x03";
            break;
          default :
            response+= "\x038\u2639☺ MAYBE!\x03";
            break;
        }

        msg.reply(response);

      });

  return irc.STATUS.STOP;
  });

}


function load(bot) {

  bot.match(/\bd(?:omain)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, onDomain);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "domain";
exports.load    = load;
exports.unload  = unload;