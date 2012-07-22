const fmt     = require( "util" ).format
    , https   = require( "https" )
    , irc     = require( "irc-js" )
    , shared  = require( "./shared" )
    , jQJSON  = require( "./jqapi.json" )
    , log     = irc.logger.get( "ircjs-plugin-jqapi" )

const onAPI = function( msg, query, index, nick ) {
  log.debug( "in onAPI" )
  const results = []
      , num     = index ? index : 1
      , replyTo = nick || msg.from.nick
  var hits = 0
    , name
    , title
    , desc
    , url
    , key
  log.debug( "interate" )
  for ( key in jQJSON ) {
    name  = jQJSON[ key ].name
    title = jQJSON[ key ].title
    desc  = jQJSON[ key ].desc
    url   = jQJSON[ key ].url
    // search for selector
    if ( -1 !== query.indexOf( ":" )
        && title.indexOf( "Selector" ) >= 0
        && name === query.replace( ":", "" ) ) {
      results.push( fmt( "%s: %s %s", title, desc, url ) )
      ++hits
    }
    // everything else
    else if ( name.toLowerCase() === query.toLowerCase()
        && title.indexOf( ":" ) === -1 ) {
      results.push( fmt( "%s: %s %s", title, desc, url ) )
      ++hits
    }
    if ( hits === num )
      break
  }
  log.debug( "checkcizncn", hits )
  if ( hits )
    if ( index && hits < index )
      msg.reply( "%s, I only found %d match%s.", replyTo, hits, hits === 1 ? "" : "es" )
    else
      msg.reply( "%s, %s", replyTo, results.pop() )
  else
    msg.reply( "%s, no matches.", replyTo )
  return irc.STATUS.STOP
}

const load = function( client ) {
  client.listen( irc.COMMAND.PRIVMSG )
        .filter( shared.filter.forMe.bind( null, client ) )
        .match( /\bapi\s+(\S+)(?:\s*#([1-9]))?(?:\s*@\s*(\S+)[\s\W]*)?$/ )
        .receive( onAPI )
  return irc.STATUS.SUCCESS
}

const unload = function() {
  return irc.STATUS.SUCCESS
}

exports.name    = "jQuery API"
exports.load    = load
exports.unload  = unload
