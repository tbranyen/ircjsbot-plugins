/**
 * @module flair
 */
 
"use strict"

const irc = require( "irc-js" )
const shared  = require("./shared")

const log = irc.logger.get("ircjs-plugin-flair")

const blacklist = new Set()

blacklist.add("#jquery")
blacklist.add("#xbmc")
blacklist.add("#openelec")

const FLAIR = {
  "alligator" : {
    "trigger" : /\balligator\b/i,
    "flair" : "---,==,'<"
  },

  "shrug" : {
    "trigger" : /\bshrugs\b/i,
    "flair" : "¯\\_(ツ)_/¯"
  },

  "y-u" : {
    "trigger" : /\by u\b/i,
    "flair" : "(屮'Д')屮"
  },

  "dentata" : {
    "trigger" : /^:dentata$/i,
    "flair" : [
      "(▼▼▼▼▼▼▼▼▼▼▼)",
      "8==========D",
      "(▲▲▲▲▲▲▲▲▲▲▲)"
    ]
  },

  "goal" : {
    "trigger" : /^:golgol$/i,
    "flair" : [
      "      _________________________________",
      "     /  _______/  ____   /  ____   /  /\\",
      "    /  / _____/  /   /  /  /___/  /  / /",
      "   /  / /_   /  /   /  /  ____   /  / /",
      "  /  /___/  /  /___/  /  /\\__/  /  /_/____",
      " /_________/_________/__/ / /__/_________/\\!!!!",
      " \\__________\\_________\__\\/  \\__\\_________\\/!!!!"
    ]
  },

  "ball" : {
    "trigger" : /^:golgolgol$/i,
    "flair" : [
      "    _,...,_",
      "  .'@/~~~\\@'.",
      " //~~\\___/~~\\\\",
      "|@\\__/@@@\\__/@|",
      "|@/  \\@@@/  \\@|",
      "  \\__/~~~\\__//",
      "  '.@\\___/@.'"
    ]
  },

  "love" : {
    "flair" : [ "I", "♥", "U", "2" ]
  },

  "thanks" : {
    "flair" : "I'm a bot you know…"
  },

  "ahem" : {
    "trigger" : /^:ahem\?$/,
    "flair" : [
      "┌─┐",
      "┴─┴",
      "ಠ_ರೃ"
    ]
  },

  "dance" : {
    "flair" : [
      "¯\\_(ツ)_/¯",
      "---(ツ)_/¯",
      "_/¯(ツ)_/¯",
      "_/¯(ツ)---",
      "_/¯(ツ)¯\\_"
    ]
  }
}

const speak = function( reply, msg ) {
  if ( shared.stfu( blacklist, msg ) ) return
  if ( reply === Object( reply ) ) {
    reply.forEach( function( reply ) {
      msg.reply( reply )
    } )
  } else {
    msg.reply( reply )
  }
}

const load = function( bot ) {
  FLAIR.love.trigger = new RegExp( "^:" + bot.user.nick + ": I love you.$", "i" )
  FLAIR.thanks.trigger = new RegExp( "^:" + bot.user.nick + ": thanks", "i" )
  FLAIR.dance.trigger = new RegExp( "^:" + bot.user.nick + ": dance", "i" )

  Object.keys( FLAIR ).forEach(function( key ) {
    bot.match( FLAIR[key].trigger, speak.bind( null, FLAIR[key].flair ) )
  })
  return irc.STATUS.SUCCESS
}

const unload = function() {
  return irc.STATUS.SUCCESS
}

exports.name    = "Flair"
exports.load    = load
exports.unload  = unload
