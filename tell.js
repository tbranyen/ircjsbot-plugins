/** @module tell
 *  @todo Only add observers for people who have notes waiting for them.
 *        Then remove when list is empty.
 */

const irc     = require( "irc-js" )
    , fmt     = require( "util" ).format
    , shared  = require( "./shared" )

const rds = shared.redis
    , redisClient = rds.client

const log = irc.logger.get( "ircjs-plugin-tell" )
    , KEY = "TELL"
    , SEP = String.fromCharCode( 0xA )

var tellInstance = null

const Note = function( from, to, note ) {
  this.date = Date.now()
  this.from = from
  this.note = note
  this.new  = true
}

Note.prototype.toString = function() {
  return [ this.new, this.date, this.from, this.to, this.note ].join( SEP )
}

Note.fromString = function( s ) {
  const parts = s.split( SEP )
      , note  = new Note( parts[2], parts[3], parts[4] )
  note.new  = parts[0] === "true"
  note.date = Number( parts[1] )
  return note
}

const Tell = function( client ) {
  if ( tellInstance )
    return tellInstance
  tellInstance = this
  this.client = client
}

Tell.prototype.notify = function( msg, num ) {
  // Probably full of async-y bugs, how to update a bunch of items at once and get a callback?
  const nick = msg.from.nick
      , key = rds.key( msg.from, KEY )
  redisClient.lrange( key, 0, -1, function( err, notes ) {
    if ( err ) {
      log.error( "Redis error in tell.js Tell.prototype.notify: %s", err )
      return
    }
    if ( ! notes || 0 === notes.length )
      return
    var reply = null
      , note = null
      , new_ = 0
      , l = notes.length
      , i
    for ( i = 0; i < l ; ++i ) {
      note = Note.fromString( notes[i] )
      if ( ! note.new )
        continue
      ++new_
      note.new = false
      log.debug( "Marking note from %s (%s) as not new", note.from, note )
      redisClient.lset( key, i, note.toString() )
    }
    if ( 0 === new_ )
      return
    const singular = new_ === 1
    reply = fmt( "%s, you have %s, just say “read” to me when you wish to read %s."
               , nick, singular ? "one new message" : new_ + " new messages"
               , singular ? "it" : "them" )
    msg.reply( reply )
  }.bind( this ) )
}

Tell.prototype.read = function( msg ) {
  const nick = msg.from.nick
      , key  = rds.key( msg.from, KEY )
      , pm   = msg.params[0] === this.client.user.nick
  redisClient.lrange( key, 0, -1, function( err, notes ) {
    if ( err ) {
      log.error( "Redis error in tell.js: %s", err )
      return
    }
    if ( ! notes || 0 === notes.length ) {
      msg.reply( "%sNo unread messages.", pm ? "" : nick + ", " )
      return
    }
    var l = notes.length
      , note = null
    while ( l-- ) {
      note = Note.fromString( notes[l] )
      msg.reply( "%sfrom %s, %s ago: %s", pm ? "" : nick + ", "
        , note.from, shared.timeAgo( note.date ), note.note )
    }
    redisClient.del( key )
  } )
  return irc.STATUS.STOP
}

Tell.prototype.add = function( msg, name, note ) {
  const from  = msg.from.nick
      , key   = rds.key( name, KEY )
  if ( key === rds.key( from, KEY ) ) {
    msg.reply( "%s, %s", from, note )
    return
  }
  if ( key === rds.key( this.client.user.nick, KEY ) ) {
    msg.reply( "%s, whatever you say…", from )
    return
  }
  const rnote = new Note( from, key, note )
  redisClient.lpush( key, rnote.toString() )
  msg.reply( "%s, I’ll tell %s about that.", from, name )
  log.debug( "Added note from %s to %s: %s", from, name, note )
  return irc.STATUS.STOP
}

const load = function( client ) {
  const tell   = new Tell( client )
      , signal = client.listen( irc.COMMAND.PRIVMSG )
      , forMe  = signal.filter( shared.filter.forMe.bind( null, client ) )
  signal.receive( tell.notify.bind( tell ) )
  forMe.filter( shared.filter.notForBotT.bind( null, client ) )
       .match( /\btell\s+(\S+)\W?\s+(.+)\s*$/i )
       .receive( tell.add.bind( tell ) )
  forMe.match( /\bread\b/i )
       .receive( tell.read.bind( tell ) )
  return irc.STATUS.SUCCESS
}

const unload = function() {
  tellInstance = null
  return irc.STATUS.SUCCESS
}

exports.name    = "Tell"
exports.load    = load
exports.unload  = unload
