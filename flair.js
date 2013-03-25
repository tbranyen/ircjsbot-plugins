/**
 * @module flair
 */
 
"use strict";

const irc = require( "irc-js" )
const shared  = require("./shared");

const log = irc.logger.get("ircjs-plugin-flair");

const blacklist = new Set();

blacklist.add('#jquery');
blacklist.add('#xbmc');
blacklist.add('#openelec');

const FLAIR =
  [ [ /\balligator\b/i,           "---,==,'<" ]
  , [ /\bshrugs\b/i,              "¯\\_(ツ)_/¯" ]
  , [ /\by u\b/i,                 "(屮'Д')屮" ]
  , [ /^:dentata$/i,            [ "(▼▼▼▼▼▼▼▼▼▼▼)"
                                , "8==========D"
                                , "(▲▲▲▲▲▲▲▲▲▲▲)" ] ] // ♥ u coldhead ;)
  , [ /^:golgol$/i,             [ "      _________________________________"
                                , "     /  _______/  ____   /  ____   /  /\\"
                                , "    /  / _____/  /   /  /  /___/  /  / /"
                                , "   /  / /_   /  /   /  /  ____   /  / /"
                                , "  /  /___/  /  /___/  /  /\\__/  /  /_/____"
                                , " /_________/_________/__/ / /__/_________/\\!!!!"
                                , " \\__________\\_________\__\\/  \\__\\_________\\/!!!!" ] ]
  , [ /^:b-ot: I love you.$/i,  [ "I", "♥", "U", "2" ] ]
  , [ /^:b-ot: thanks\b/i,        "I'm a bot you know…" ]
  , [ /^:golgolgol$/i,          [ "    _,...,_"
                                , "  .'@/~~~\\@'."
                                , " //~~\\___/~~\\\\"
                                , "|@\\__/@@@\\__/@|"
                                , "|@/  \\@@@/  \\@|"
                                , "  \\__/~~~\\__//"
                                , "  '.@\\___/@.'" ] ]
  , [ /^:ahem\?$/,              [ "┌─┐"
                                , "┴─┴"
                                , "ಠ_ರೃ" ] ]
  , [ /^:b-ot: dance\b/i,       [ "¯\\_(ツ)_/¯"
                                , "---(ツ)_/¯"
                                , "_/¯(ツ)_/¯"
                                , "_/¯(ツ)---"
                                , "_/¯(ツ)¯\\_" ] ]
  ]

const speak = function( reply, msg ) {
  if ( shared.stfu( blacklist, msg ) ) return;
  if ( reply === Object( reply ) ) {
    reply.forEach( function( reply ) {
      msg.reply( reply )
    } )
  } else {
    msg.reply( reply )
  }
}

const load = function( bot ) {
  FLAIR.forEach( function( f ) {
    bot.match( f[0], speak.bind( null, f[1] ) )
  } )
  return irc.STATUS.SUCCESS
}

const unload = function() {
  return irc.STATUS.SUCCESS
}

exports.name    = "Flair"
exports.load    = load
exports.unload  = unload

