const fmt     = require( "util" ).format
    , https   = require( "https" )
    , irc     = require( "irc-js" )
    , shared  = require( "./shared" )

const log     = irc.logger.get( "ircjs-plugin-crew" )
    // All data is stored in a Redis hash, with normalized IRC nicks as keys.
    , crewKey = "CREW"
    , crewURL = { host: "raw.github.com"
                , path: "/jquery-ot/ot-crew.com/master/public/crew.json" }

/** The data is an array of these:
 *    { "irc": "nick"
 *    , "twitter": "handle"
 *    , "github": "user"
 *    , "location": "place"
 *    , "name": "first last other or so"
 *    , "birthday": "A Date object, one might think, and be wrong"
 *    , "imgUrl": "http://www.jpg.gif"
 *    , "occupation": "liberation"
 *    }
 */

const redisClient = shared.redis.client

const prettyPrint = function( data ) {
  const ret = []
  for ( var k in data )
    if ( data.hasOwnProperty( k ) )
      ret.push( k, "→", data[ k ], "•" )
  ret.pop()
  return ret.join( ' ' )
}

// Looks for ?f(inger) <name>, replies with crew data.
const onFinger = function( msg, nick ) {
  redisClient.hget( crewKey, irc.id( nick )
    , function( err, res ) {
    if ( err ) {
      log.error( "Error getting crüe data: %s", err )
      return irc.STATUS.ERROR
    }
    if ( res )
      msg.reply( "%s, %s", msg.from.nick
        , prettyPrint( JSON.parse( res ) ) )
    else
      msg.reply( "%s, no idea who %s is.", msg.from.nick, nick )
  } )
  return irc.STATUS.STOP
}

const load = function( client ) {
  shared.getJSON( crewURL, function( data ) {
    const headCount = data.length
    log.debug( "Got crew data:", data )
    // Now convert from array of objects to object keyed on nick/id
    // because then we can shove it straight into redis with hmset.
    const redisData = {}
    data.forEach( function( crewMember ) {
      redisData[ irc.id( crewMember.irc ) ] = JSON.stringify( crewMember )
    } )
    redisClient.hmset( crewKey, redisData )
  } )
  client.listen( irc.COMMAND.PRIVMSG )
        .filter( shared.filter.forMe.bind( null, client ) )
        .match( /\bf(?:inger)?\s+(\S+)/i )
        .receive( onFinger )
  return irc.STATUS.SUCCESS
}

const unload = function() {
  return irc.STATUS.SUCCESS
}

exports.name    = "Crew"
exports.load    = load
exports.unload  = unload
