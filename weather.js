/**
 * @module weather
 */

"use strict";

const fmt     = require("util").format;
const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-weather");
const APIKEYS = ['dc2f9ffc1dacb602','63dae8bbfe95a2b8']
const icons   = {
  "snow":      "☃❄",
  "clear":     "☼",
  "sun":       "☀",
  "cloud":     "☁",
  "rain":      "☔",
  "overcast":  "☁",
  "shower":    "☂☁",
  "lightning": "⚡",
  "thunder":   "⚡",
  "haze":      "≈"
}

var crew

function onWeather(msg, query, index, nick) {
  if (!query) {
    query = msg.from.nick;
  }

  /* See if we are looking for someone in the crews weather */
  var member = crew.filter(function(v){ return v.irc.toLowerCase() === query.toLowerCase() });

  if (member.length) {
    query = member[0].location;
  }

  const q = query.replace(/ /g, "+");
  const replyTo = nick || msg.from.nick;
  const url = {
    host: "api.wunderground.com",
    path: "/api/" + APIKEYS[Math.floor(Math.random() * APIKEYS.length)] + "/conditions/q/" + encodeURI(query) + ".json"
  };

  http.get(url, function(res) {
    const data = [];
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data))
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        const j = JSON.parse(data.join(""));

        if (j.response.error) {
          msg.reply(j.response.error.description);
        }
        else if (j.response.results) {
          msg.reply("Found %s cities searching for %s, please be more specific!", j.response.results.length, query);
        }
        else if (j.current_observation) {
          var key,
              currIcons = [],
              feelslike = "";

          // Get icons for current weather
          for (key in icons) {
              if (j.current_observation.weather.toLowerCase().match(key, "i")) {
                  currIcons.push(icons[key]);
              }
          }

          if (currIcons.length) {
            currIcons = currIcons.join("");
          }

          // See if the feels like weather is different
          if (j.current_observation.temp_f != j.current_observation.feelslike_f) {
            feelslike = " Feels like \x02" + j.current_observation.feelslike_f + "°F\x02/\x02" + j.current_observation.feelslike_c + "°C\x02";
          }

          msg.reply("%s %s \x02%s°F\x02/\x02%s°C\x02. %s [%s]",
                    currIcons,
                    j.current_observation.weather,
                    j.current_observation.temp_f,
                    j.current_observation.temp_c,
                    feelslike,
                    j.current_observation.display_location.full);
        }
      });
  });

  return irc.STATUS.STOP;
}


function load(bot) {
    // Load the crew
    shared.getJSON('https://raw.github.com/ot-crew/ot-crew.com/master/public/crew.json', function (obj) {
      crew = obj;
    });

    bot.match(/^:[!,./\?@`]w(?:eather)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i, onWeather);
    bot.match(/^:[!,./\?@`]w(?:eather)?\s*$/, onWeather);

    return irc.STATUS.SUCCESS;
  }

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "weather";
exports.load    = load;
exports.unload  = unload;
