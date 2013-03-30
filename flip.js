/**
 * @module flip
 */

"use strict";

const irc     = require("irc-js");
const shared  = require("./shared");

const chars = {
    'a' : '\u0250',
    'b' : 'q',
    'c' : '\u0254',
    'd' : 'p',
    'e' : '\u01DD',
    'f' : '\u025F',
    'g' : 'b',
    'h' : '\u0265',
    'i' : '\u0131',
    'j' : '\u027E',
    'k' : '\u029E',
    'l' : '\u05DF',
    'm' : '\u026F',
    'n' : 'u',
    'o' : 'o',
    'p' : 'd',
    'q' : 'b',
    'r' : '\u0279',
    's' : 's',
    't' : '\u0287',
    'u' : 'n',
    'v' : '\u028C',
    'w' : '\u028D',
    'x' : 'x',
    'y' : '\u028E',
    'z' : 'z',
    '[' : ']',
    ']' : '[',
    '(' : ')',
    ')' : '(',
    '{' : '}',
    '}' : '{',
    '?' : '\u00BF',  
    '\u00BF' : '?',
    '!' : '\u00A1',
    "\'" : ',',
    ',' : "\'",
    '.' : '\u02D9',
    '_' : '\u203E',
    ';' : '\u061B',
    '9' : '6',
    '6' : '9',
    '\u2234' : '\u2235',
    '>' : '<',
    '<' : '>',
    '/' : '\\',
    '\\' : '/'
}

function flip(msg, query) {
  msg.reply('(╯°□°）╯︵' + query.toLowerCase().split('').map(function(c) {
    return chars[c] ? chars[c] : c;
  }).reverse().join(''));
}

// Implement Plugin interface.

function load(bot) {
  bot.register("flip", /(.+)/, flip);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Flip";
exports.help    = "Flip things with \"!flip [whatever]\".";
exports.load    = load;
exports.unload  = unload;
