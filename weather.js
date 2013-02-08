/**
 * @module weather
 */

'use strict';

const fmt     = require('util').format;
const http    = require('http');
const irc     = require('irc-js');
const shared  = require('./shared');
const log     = irc.logger.get('ircjs-plugin-weather');
const APIKEYS = ['dc2f9ffc1dacb602','63dae8bbfe95a2b8']
const icons   = {
  'snow':      '☃❄',
  'clear':     '☼',
  'sun':       '☀',
  'cloud':     '☁',
  'rain':      '☔',
  'overcast':  '☁',
  'shower':    '☂☁',
  'lightning': '⚡',
  'thunder':   '⚡',
  'haze':      '≈'
};

var crew;

function onWeather(msg, query, index, nick) {
  if (!query) {
    query = msg.from.nick;
  }

  // See if we are looking for someone in the crews weather
  var member = crew.filter(function(v){ return v.irc.toLowerCase() === query.toLowerCase() });

  if (member.length) {
    query = member[0].location;
  }

  const q = query.replace(/ /g, '+');
  const replyTo = nick || msg.from.nick;
  const url = {
    host: 'api.wunderground.com',
    path: fmt('/api/%s/conditions/q/%s.json', APIKEYS[Math.floor(Math.random() * APIKEYS.length)], encodeURI(query))
  };

  http.get(url, function(res) {
    const data = [];
    res
      .on(irc.NODE.SOCKET.EVENT.DATA, data.push.bind(data))
      .on(irc.NODE.SOCKET.EVENT.END, function() {
        const j = JSON.parse(data.join(''));
        var obs;

        if (j.response.error) {
          msg.reply(j.response.error.description);
        }
        else if (j.response.results) {
          msg.reply(fmt('found %s cities searching for %s, please be more specific!', j.response.results.length, query));
        }
        else if (obs = j.current_observation) {
          // Feels like
          const feelsLike = Math.round(obs.temp_c) != Math.round(obs.feelslike_c) ?
            fmt('Feels like %s. ', format_temp(obs.feelslike_f, obs.feelslike_c)) :
            '';

          // Get icons for current weather
          const currIcons = Object.keys(icons)
            .filter(function(i) { return RegExp(i, 'i').test(obs.weather); })
            .map(function(i) { return icons[i]; })
            .join('');

          msg.reply(fmt('%s %s %s. %s%s',
                    currIcons,
                    obs.weather,
                    format_temp(obs.temp_f, obs.temp_c),
                    feelsLike,
                    obs.display_location.full));
        }
      });
  });

  return irc.STATUS.STOP;
}

function format_temp (f, c) {
  return fmt("\x02%s°F\x02/\x02%s°C\x02", f, c);
}

function load(bot) {
  // Load the crew
  shared.getJSON('https://raw.github.com/ot-crew/ot-crew.com/master/public/crew.json', function (obj) {
    crew = obj;
  });

  bot.register("w", /(.+)?/gi, onWeather);
  bot.register("weather", /(.+)?/gi, onWeather);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "weather";
exports.load    = load;
exports.unload  = unload;
