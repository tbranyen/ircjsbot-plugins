/**
 * @module google
 */

const fmt      = require( "util" ).format
    , irc      = require( "irc-js" )
    , exec     = require( "child_process" ).exec
    , unescape = require( "./shared" ).unescape

// An object for good old bot-t, handy for checking its presence
const botT = irc.person( "bot-t" )
    , botTPrefix = "?"

const search = function( query, hb ) {
  exec( fmt( "curl -e 'http://gf3.ca/' 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=%s'", escape( query ) )
       , function ( err, stdout, stderr ) {
         const results = JSON.parse( stdout ).responseData.results
         hb.call( null, results )
       } )
}

const speak = function( msg, prefix, query, index, person ) {
  // Shut up if bot-t's prefix was used and bot-t is there
  if ( prefix === botTPrefix && irc.channel( msg.params[0] )
      .people.has( botT.id ) )
    return

  search( query, function( results ) {
    if ( results.length )
      msg.reply( fmt( "%s, %s → %s"
                     , ( person || msg.from.nick ).trim()
                     , unescape( results[index].titleNoFormatting )
                     , results[res].unescapedUrl ) )
    else
      msg.reply( fmt( "%s, sorry, no results for ‟%s”", msg.from.nick, query ) )
  } )
}

// Implement Plugin interface.

const load = function( bot ) {
  bot.lookFor( /^:([\/.,`?]?)g +([^#@]+)(?: *#([1-9]))?(?: *@ *([-\[\]\{\}`|_\w]+))? *$/, speak )
  return irc.STATUS.SUCCESS
}

const eject = function() {
  if ( rc )
    rc.quit()
  return irc.STATUS.SUCCESS
}

exports.name  = "Google"
exports.load  = load
exports.eject = eject

