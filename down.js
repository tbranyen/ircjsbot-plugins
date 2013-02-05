/**
 * @module down
 */

"use strict";

const http    = require("http");
const irc     = require("irc-js");
const shared  = require("./shared");
const url     = require("url");


function down(msg,query) {

  query = query.replace(/(ftp:\/\/|https:\/\/)/gi,'http://');

  // Append http if we need it
  if (!query.match(/^[a-zA-Z]+:\/\//)) {
      query = 'http://' + query;
  }


  var options = url.parse(query);

  var req = http.request(options, function(res) {
    if([200,301,302].indexOf(res.statusCode) >= 0) {
      msg.reply("It's just you. \x02%s is up!\x02 (%s %s)", query, res.statusCode, http.STATUS_CODES[res.statusCode]);
    }
    else {
      msg.reply("It's not just you! \x02%s is down!\x02 (%s %s)", query, res.statusCode, http.STATUS_CODES[res.statusCode]);
    }
  });

  req.on('error',function(err) {
    msg.reply("¯\\_(ツ)_/¯ It's not just you! \x02%s is down!\x02 (%s)", query, err.code);
  });

  req.end();
}

function load(bot) {
  bot.match(/^down\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i,down);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Down";
exports.load    = load;
exports.unload  = unload;
