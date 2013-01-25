/**
 * @module desc
 * This module fetches titles + descriptions for sites shared in a channel IF the message is simply an URL
 * This module is also an example of how to use cheerio to walk the dom (ala jQuery).
 * Dependencies not included in ircjsbot are: cheerio + request (request because it follows redirects, which the entire internet is built on, apparently).
 */

"use strict";

const irc     = require("irc-js");
const cheerio = require("cheerio");
const request = require('request');
const shared  = require("./shared");

function say(msg, reply) {
  if(reply !== undefined) {
    msg.reply(shared.unescape(reply));
  }
}

function getDesc(msg, query) {
  request( {
      headers : { "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1309.0 Safari/537.17" },
      url : msg.params[1].replace(/^:/,'')
    }, function (error, response, body) {

      if (!error && response.statusCode == 200) {

        const $     = cheerio.load(body);
        const desc  = $( 'meta[name="description"]' ).attr( 'content' ) || $( 'meta[property="og:description"]' );
        const title = $( 'title' ).text();
        const toSay = ( desc.length ) ? title + ' → ' + desc : title;
      
        say(msg, toSay);
      }
  });
}

function load(bot) {
  bot.match(/^:(?:[a-z]+:\/\/)?[0-9a-z](?:[\d\w\-\.]+\.)+[a-z]{2,4}(?:\:[0-9]{1,6})?(?:[\d\w\-\.\/\?=&#%+]*$)/i, getDesc);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "description";
exports.load    = load;
exports.unload  = unload;
