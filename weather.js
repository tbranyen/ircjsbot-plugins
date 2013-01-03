/**
 * @module weather
 */

"use strict";

const fmt     = require("util").format;
const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-weather");
const request = require('request'); 

var crew,
    icons = {
          "snow" : "☃❄"
        , "clear" : "☼"
        , "sun" : "☀"
        , "cloud" : "☁"
        , "rain" : "☔"
        , "overcast" : "☁"
        , "shower" : "☂☁"
        , "lightning" : "⚡"
        , "thunder" : "⚡"
        , "haze" : "≈"
      }

var APIKEYS = ['dc2f9ffc1dacb602','63dae8bbfe95a2b8']

function onWeather(msg, query, index, nick) {
  if (query == '') {
    query = msg.from.nick;
  }

  /* See if we are looking for someone in the crews weather */
  var member = crew.filter(function(v){ return v.irc.toLowerCase() === query.toLowerCase() });

  if(member.length) {
    query = member[0].location;
  }
  const q = query.replace(/ /g,"+")
    , replyTo = nick || msg.from.nick
    , url = {
        host: "api.wunderground.com",
        path: "/api/"+ APIKEYS[Math.floor(Math.random() * APIKEYS.length)] +"/conditions/q/" + encodeURI(query) + ".json"
      }
    , feelslike = "";


  http.get(url, function(res) {
    const data = [];
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data))
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        
        const j = JSON.parse(data.join(""));

        if(j.response.error) {
          msg.reply(j.response.error.description);
          return;
        }

        if(j.response.results) {
          msg.reply("Found %s cities searching for %s, please be more specific!", j.response.results.length, query);
          return;
        }

        if(j.current_observation) {

          var currIcons = [],
              feelslike = "";

          // Get icons for current weather
          for (var key in icons) {
              if(j.current_observation.weather.toLowerCase().match(key,"i")) {
                  currIcons.push(icons[key]);
              }
          }

          if(currIcons.length) {
            currIcons = currIcons.join("");
          }

          // See if the feels like weather is different 
          if (j.current_observation.temp_f != j.current_observation.feelslike_f) {
            feelslike = " Feels like \x02" + j.current_observation.feelslike_f + "℉ / " + j.current_observation.feelslike_c + "℃\x02";
          }

          msg.reply("%s %s \x02%s℉ / %s℃\x02. %s"
            , currIcons
            , j.current_observation.weather
            , j.current_observation.temp_f
            , j.current_observation.temp_c
            , feelslike
          );
        }

      });
  });

  return irc.STATUS.STOP;
}


function load(bot) {
    //load the crew
    request('https://raw.github.com/ot-crew/ot-crew.com/master/public/crew.json',function (error, response, body) {
      if (!error && response.statusCode == 200) {
        crew = JSON.parse(body);
      }
    });


  bot.match(/\bw(?:eather)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,
    shared.forMe, onWeather);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "weather";
exports.load    = load;
exports.unload  = unload;
