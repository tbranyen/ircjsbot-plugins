/** @module spotify */

"use strict";

const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");

const ERROR   = irc.STATUS.ERROR;
const STOP    = irc.STATUS.STOP;
const SUCCESS = irc.STATUS.SUCCESS;

const log = irc.logger.get("ircjs");

/** Spotify search types.
 *  @enum {string}
 */
const TYPE = {
  ALBUM:  "album",
  ARTIST: "artist",
  TRACK:  "track"
};

const POPBAR = "\x0314\u25AE\x03";
const POPBARLIT = "\x036\u25AE\x03";

const popularity  = new Array(11);

function printPopularity(n) {
  const pop = Math.round(n * 10);
  for (let i = 0; i < 10; ++i) {
    popularity[i] = i >= pop ? POPBAR : POPBARLIT;
  }
  return popularity.join("");
}

function printArtists(arr) {
  const len = arr.length;
  if (len == 1) { return "\x02" + arr[0].name + "\x02"; }
  const out = new Array(arr.length);
  for (let i = 0, l = len; i < l; ++i) {
    if (i > 0) {
      out.push(i == l - 1 ? " and " : ", ");
    }
    out.push("\x02" + arr[i].name + "\x02");
  }
  return out.join("");
}

function printItem(item) {
  const out = [];
  const artists = item.artist ? [{"name": item.artist}] : item.artists;
  out.push("\x02\x033\u2669\x03\x02");
  out.push("\x02" + item.name + "\x02");
  if (artists) {
    out.push("\x0314by\x03", printArtists(artists));
  }
  if (item.popularity) {
    out.push(printPopularity(item.popularity));
  }
  if (item.href) {
    out.push("\x0314" + item.href + "\x03");
  }
  return out.join(" ");
}

/** Get info for a Spotify URI.
 *  @param  {Message} msg
 *  @param  {TYPE}    type
 *  @param  {string}  id
 */
function lookup(msg, type, id) {
  let path = "/lookup/1/.json?uri=spotify:" + type + ":" + id;
  getSpotifyJSON(path, function(res) {
    if (!res) { return; }
    delete res[type].href;
    return msg.reply(printItem(res[type]));
  });
  return SUCCESS;
}

/** Search the Spotifies.
 *  @param  {Message} msg
 *  @param  {TYPE}    type
 *  @param  {string}  query
 *  @param  {number}  index
 */
function search(msg, type, query, index) {
  type  = type ? type : TYPE.TRACK;
  index = index ? index : 1;
  const path  = "/search/1/" + type + ".json?q=" + query;
  getSpotifyJSON(path, function(res) {
    const results = res ? Math.min(res["info"]["num_results"] -
      res["info"]["offset"], res["info"]["limit"]) : 0;
    if (!results) {
      msg.reply("Didn’t find any " + type + " matching “" + query + "”.");
      return;
    }
    if (results < index) {
      msg.reply("I only found " + results + " " + type + (results === 1 ? "" : "s") + ", you asked for #" + index);
      return;
    }
    msg.reply(printItem(res[type + "s"][index - 1]));
  });

  return SUCCESS;
}

// Default HTTP options.
const httpOpts = {
  host: "ws.spotify.com",
  path: "",
  method: "GET"
};

/** Get JSON from Spotify web service.
 *  @param  {string}  path
 */
function getSpotifyJSON(path, cb) {
  httpOpts.path = encodeURI(path);
  const req = http.get(httpOpts, function(res) {
    const data = [];
    res.setEncoding("utf8");
    res.on("data", data.push.bind(data));
    res.on("end", function() {
      let res = null;
      try {
        res = JSON.parse(data.join(""));
      } catch (err) {
        log.error("Spotify fail: " + err.message);
      }
      cb(res);
    });
  });
  req.on("error", function(err) {
    cb(null);
  });
}

function load(bot) {
  const searchRE =
    /(?:(album|artist|track)\s+)?([^@#]+)(?:\s*#([1-9]\d*))?/;
  const lookupRE =
    /\b(?:open.spotify.com|spotify)[/:](album|artist|track)[/:](\S+)/;
  bot.register("spotify", searchRE, search);
  bot.match(lookupRE, lookup);
  return SUCCESS;
}

function unload(bot) {
  return SUCCESS;
}

exports.name    = "Spotify";
exports.load    = load;
exports.unload  = unload;
