/**
 * @module flair
 */
const irc = require( "irc-js" )

const FLAIR =
  [ [ /\balligator\b/i,   "---,==,'<" ]
  , [ /\bshrugs\b/i,      "¯\\_(ツ)_/¯" ]
  , [ /\by u\b/i,         "(屮'Д')屮" ]
  , [ /\bdentata\b/i,   [ "(▼▼▼▼▼▼▼▼▼)"
                        , "8==========D"
                        , "(▲▲▲▲▲▲▲▲▲)" ] ] // ♥ u coldhead ;)
  , [ /\bgol\b/i,
      [ "      _________________________________"
      , "     /  _______/  ____   /  ____   /  /\\"
      , "    /  / _____/  /   /  /  /___/  /  / /"
      , "   /  / /_   /  /   /  /  ____   /  / /"
      , "  /  /___/  /  /___/  /  /\\__/  /  /_/____"
      , " /_________/_________/__/ / /__/_________/\\!!!!"
      , " \\__________\\_________\__\\/  \\__\\_________\\/!!!!" ] ]
  , [ /\bi love u b-ot\b/i, [ "I", "♥", "U", "2" ] ]
  ]

const speak = function( reply, msg ) {
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

