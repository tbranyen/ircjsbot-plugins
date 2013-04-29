/** @module rdio */

"use strict";

const http    = require("http");
const irc     = require("irc-js");
const qs      = require("querystring");

const ERROR   = irc.STATUS.ERROR;
const STOP    = irc.STATUS.STOP;
const SUCCESS = irc.STATUS.SUCCESS;

const log = irc.logger.get("ircjs");

function printItem(item) {
  const out = [];
  const artists = item.artist ? [{"name": item.artist}] : item.artists;
  out.push("\x02\x033\u2669\x03\x02");
  out.push("\x02" + item.name + "\x02");
  if (item.url) {
    out.push("\x0314" + item.url + "\x03");
  }
  return out.join(" ");
}

/** Get info for a rdio URI.
 *  @param  {Message} msg
 *  @param  {TYPE}    type
 *  @param  {string}  id
 */
function lookup(msg, shortCode) {
  let data = qs.stringify({  
    "short_code" : shortCode
  });

  httpOpts.path = "/1/getObjectFromShortCode";
  httpOpts.headers["Content-Length"] = data.length;

  const req = http.request(httpOpts, function(res) {
    const data = [];
    res.setEncoding("utf8");
    res.on("data", data.push.bind(data));
    res.on("end", function() {
      let res = null;
      try {
        res = JSON.parse(data.join(""));
      } catch (err) {
        log.error("Rdio fail: " + err.message);
      }
      return msg.reply(printItem(res));
    });
  });

  req.on("error", function(err) {
    // Crickets
  });

  req.end(data);

  return SUCCESS;
}

// Default HTTP options.
const httpOpts = {
  host: "api.rdio.com",
  path: "",
  method: "POST",
  headers: {  
    'Content-Type': 'application/x-www-form-urlencoded'
  }  
};

function load(bot) {
  bot.match(/(?:rd\.io\/x\/)(\w+)(?:\/)?/, lookup);
  return SUCCESS;
}

function unload(bot) {
  return SUCCESS;
}

exports.name    = "Rdio";
exports.load    = load;
exports.unload  = unload;
