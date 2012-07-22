/**
 * @module google
 */

const fmt     = require( "util" ).format
    , irc     = require( "irc-js" )
    , exec    = require( "child_process" ).exec
    , shared  = require( "./shared" )

const unescape = shared.unescape

const search = function( query, hb ) {
  exec( fmt( "curl -e 'http://gf3.ca/' 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=%s'", encodeURIComponent( query ) )
       , function ( err, stdout, stderr ) {
         const results = JSON.parse( stdout ).responseData.results
         hb.call( null, results )
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

