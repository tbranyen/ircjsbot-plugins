/**
 * @module caniuse
 */

"use strict";

const fmt     = require("util").format;
const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");

var links;

function getAgents(r,a) {
  return Object.keys(r).map(function(k) {
    return a[k].name + ' ' + r[k];
  }).join(', ').replace(/,([^,]*?)$/, ', and$1');
}

function getFeats(f) {
  links = [];
  return Object.keys(f).map(function(k) {
    links.push(fmt(' http://caniuse.com/#search=%s', k));
    return f[k];
  }).join(', ').replace(/,([^,]*?)$/, ', and$1');
}

function onCaniuse(msg, query, index, nick) {
  const q = query.replace(/ /g,"+")
    , url = {
        host: "api.html5please.com",
        path: "/" + encodeURIComponent(q) + ".json?noagent"
    };
  
  http.get(url, function(res) {
    const data = [];
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data))
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        const j = JSON.parse(data.join(""));

        if (j.supported != "unknown" && j.features.length !== 0) {

          const features = getFeats(j.features)
            , agents = getAgents(j.results,j.agents);

          if(agents.length) {
            msg.reply("You can use %s with: %s.%s", features, agents, links.join());
          } else {
            msg.reply("is not fully supported anywhere.");
          }
        }
      });
  });

  return irc.STATUS.STOP;
}

function load(bot) {
  bot.match(/\bc(?:aniuse)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, onCaniuse);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "caniuse";
exports.load    = load;
exports.unload  = unload;
