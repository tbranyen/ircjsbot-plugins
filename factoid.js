/**
 * @module factoid
 */

const fmt     = require( "util" ).format
    , irc     = require( "irc-js" )
    , shared  = require( "./shared" )

const log   = irc.logger.get( "ircjs-plugin-factoid" )
    , sKey  = "FACTOID"

// Factoids.

const redisClient = shared.redis.client

const speak = function( client, msg, trigger, person ) {
  redisClient.hget( sKey, trigger, function( err, res ) {
    if ( err ) {
      log.error( "Error hget:ing factoid: %s", err )
      return
    }
    if ( ! res )
      return
    msg.reply( "%s, %s", person || msg.from.nick, res )
    return irc.STATUS.STOP
  } )
}

const learn = function( msg, key, value ) {
  log.debug( "factoid learn `%s`", key )
  redisClient.hset( sKey, key, value, function( err, res ) {
    if ( err ) {
      log.error( "learn factoid error: %s", err )
      return
    }
    log.debug( "Learned a new factoid: %s", key )
    msg.reply( "%s, memorised “%s”.", msg.from.nick, key )
  } )
}

const forget = function( msg, key ) {
  log.debug( "factoid forget `%s`", key )
  redisClient.hdel( sKey, key, function( err, res ) {
    if ( err ) {
      log.error( "forget factoid error: %s", err )
      return
    }
    // Nothing was deleted
    if ( res === 0 ) {
      msg.reply( "%s, I can’t forget that which I do not know.", msg.from.nick )
      return
    }
    const replyText = fmt( "%s, I have forgotten “%s”%s"
      , msg.from.nick, key
      , Math.random() > 0.5 ? ". My mind is going, I can feel it." : "." )
    msg.reply( replyText )
    log.debug( "Happily forgot factoid: %s", key )
  } )
}

// Implement Plugin interface.

const load = function( client ) {
  const signal =
    client.listen( irc.COMMAND.PRIVMSG )
          .filter( shared.filter.forMe.bind( null, client ) )
          .filter( shared.filter.notForBotT.bind( null, client ) )
  signal.match( /([-_.:|\/\\\w]+) +is[:,]? +(.+)$/ )
        .receive( learn )
  signal.match( /forget\s+([-_.:|\/\\\w]+)$/ )
        .receive( forget )
  signal.match( /([-_.:|\/\\\w]+)(?:\s*@\s*([-\[\]\{\}`|_\w]+))?\s*$/ )
        .receive( speak.bind( null, client ) )
  return irc.STATUS.SUCCESS
}

const unload = function() {
  return irc.STATUS.SUCCESS
}

exports.name    = "Factoid"
exports.load    = load
exports.unload  = unload
