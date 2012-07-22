/**
 * @module google
 */

const fmt     = require( "util" ).format
    , https   = require( "https" )
    , irc     = require( "irc-js" )
    , shared  = require( "./shared" )

const unescape = shared.unescape

const search = function( query, callback ) {
  const url = { host: "ajax.googleapis.com"
              , path: fmt( "/ajax/services/search/web?v=1.0&q=%s"
                         , encodeURIComponent( query ) )
              }
  https.get( url, function( response ) {
    const data = []
    response.on( irc.NODE.SOCKET.EVENT.DATA, data.push.bind( data ) )
    response.on( irc.NODE.SOCKET.EVENT.END, function() {
      const results = JSON.parse( data.join( "" ) ).responseData.results
      callback( results )
    } )
  } )
}

const speak = function( msg, query, index, person ) {
  const idx = index || 0
  search( query, function( results ) {
    if ( results.length )
      msg.reply( "%s, %s → %s"
               , person || msg.from.nick
               , unescape( results[idx].titleNoFormatting )
               , results[idx].unescapedUrl )
    else
      msg.reply( "%s, sorry, no results for ‟%s”.", msg.from.nick, query )
  } )
  return irc.STATUS.STOP
}

// Implement Plugin interface.

const load = function( client ) {
  client.listen( irc.COMMAND.PRIVMSG )
        .filter( shared.filter.forMe.bind( null, client ) )
        .filter( shared.filter.notForBotT.bind( null, client ) )
        .match( /\bg(?:oogle)?\s+([^#@]+)(?:\s*#(\d+))?(?:\s*@\s*(\S+))?\s*$/i )
        .receive( speak )
  return irc.STATUS.SUCCESS
}

const unload = function() {
  return irc.STATUS.SUCCESS
}

exports.name    = "Google"
exports.load    = load
exports.unload  = unload
