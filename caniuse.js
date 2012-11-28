/**
 * @module caniuse
 */

"use strict";

const http   = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");

function speak(msg, query, index, person) {

  var q = query.replace(/ /g,'+')
    , use = ''
    , agents = ''
    , links = '';

  const url = {
    host: 'api.html5please.com',
    path: '/' + encodeURIComponent(q) + '.json?noagent'
  };
  http.get(url, function(res) {
    var data = '';
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, function ( c ) { data += c })
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        var j = JSON.parse(data);

        if (j.supported != 'unknown' && j.features.length !== 0) {
                
          var f = j.features
            , r = j.results
            , a = j.agents;

          use += Object.keys(f).map(function(k) {
            links += ' http://caniuse.com/#search=' + k
            return f[k];
          }).join(', ').replace(/,([^,]*?)$/, ', and$1');
                
          agents += Object.keys(r).map(function(k) {
            return j.agents[k].name + ' ' + r[k];
          }).join(', ').replace(/,([^,]*?)$/, ', and$1');
                
          if(agents.length) {
            msg.reply(msg.from.nick + ': You can use ' + use + ' with ' + agents + '.' + links);
          } else {
            msg.reply(msg.from.nick + ': is not fully supported anywhere.');
          }
        }
      });
  });

  return irc.STATUS.STOP;
}

function load(bot) {
  bot.match(/\bc(?:aniuse)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, speak);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "caniuse";
exports.load    = load;
exports.unload  = unload;
