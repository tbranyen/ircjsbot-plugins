const fmt     = require( "util" ).format
    , irc     = require( "irc-js" )
    , shared  = require( "./shared" )

const log     = irc.logger.get( "ircjs-plugin-wat" )
    , watURL  = { host: "raw.github.com", path: "/gf3/WAT/master/wat.json" }
    , sKey    = "WAT"

const redisClient = shared.redis.client

const onWat = function( msg ) {
  redisClient.srandmember( sKey, function( err, res ) {
    if ( err ) {
      log.error( "onWat error: %s", err )
      return
    }
    if ( res )
      msg.reply( res )
  } )
}

const load = function( bot ) {
  shared.getJSON( watURL, function( data ) {
    log.debug( "Got wat JSON: %s thingies", data.length )
    redisClient.sadd( sKey, data )
  } )
  bot.match( /^:w[au]t\W*$/i, onWat )
  return irc.STATUS.SUCCESS
}

const unload = function() {
  return irc.STATUS.SUCCESS
}

exports.name    = "Wat!"
exports.load    = load
exports.unload  = unload
