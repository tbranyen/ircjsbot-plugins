/** @module tell
 *  @todo Only add observers for people who have notes waiting for them.
 *        Then remove when list is empty.
 */

"use strict";

const irc     = require("irc-js");
const fmt     = require("util").format;
const shared  = require("./shared");

const rds = shared.redis;
const redisClient = rds.client;

const log = irc.logger.get("ircjs-plugin-tell");
const KEY = "TELL";
const SEP = String.fromCharCode(0xA);

function Note(from, to, note) {
  this.date = Date.now();
  this.from = from;
  this.note = note;
  this.new  = true;
}

Note.prototype.toString = function() {
  return [this.new, this.date, this.from, this.to, this.note].join(SEP);
};

Note.fromString = function(s) {
  const parts = s.split(SEP);
  const note  = new Note(parts[2], parts[3], parts[4]);
  note.new  = parts[0] === "true";
  note.date = Number(parts[1]);
  return note;
}

function notify(msg, _) {
  // Probably full of async-y bugs, how to update a bunch of items at once and get a callback?
  const nick = msg.from.nick;
  const key  = rds.key(msg.from, KEY);
  redisClient.lrange(key, 0, -1, function(err, notes) {
    if (err) {
      log.error("Redis error in tell.js Tell.prototype.notify: %s", err);
      return;
    }
    if (!notes || 0 === notes.length) {
      return;
    }
    let new_  = 0;
    for (let i = 0, l = notes.length; i < l; ++i) {
      let note = Note.fromString(notes[i]);
      if (!note.new) {
        continue;
      }
      ++new_;
      note.new = false;
      log.debug("Marking note from %s (%s) as not new", note.from, note);
      redisClient.lset(key, i, note.toString(),
        function(err, res) { if (err) { log.error(err); }});
    }
    if (0 === new_) {
      return;
    }
    const one = new_ === 1;
    msg.reply("You have %s%s, use `read when you wish to read %s.",
      one ? "1 new message" : new_ + " new messages",
      notes.length === new_ ? "" : " (and " + (notes.length - new_) + " unread)",
      one ? "it" : "them");
  });
}

function read(bot, msg) {
  const nick = msg.from.nick;
  const key  = rds.key(msg.from, KEY);
  redisClient.lrange(key, 0, -1, function(err, notes) {
    if (err) {
      log.error("Redis error in tell.js: %s", err);
      return irc.STATUS.STOP;
    }
    if (!notes || 0 === notes.length) {
      msg.reply("No unread messages.");
      return irc.STATUS.STOP;
    }
    let l = notes.length;
    let note = null;
    while (l--) {
      note = Note.fromString(notes[l]);
      msg.reply("From %s, %s: %s", note.from, shared.timeAgo(note.date), note.note);
    }
    redisClient.del(key, function(err, res) { if (err) { log.error(err); }});
  });
  return irc.STATUS.STOP;
}

function add(bot, msg, name, note) {
  const from  = msg.from.nick;
  const key   = rds.key(name, KEY);
  if (irc.id(name) === msg.from.id) {
    msg.reply(note);
    return irc.STATUS.STOP;
  }
  if (irc.id(name) === bot.user.id) {
    msg.reply("\x01ACTION explodes\x01");
    return irc.STATUS.STOP;
  }
  const rnote = new Note(from, key, note);
  redisClient.lpush(key, rnote.toString());
  msg.reply("I’ll tell %s about that.", name);
  log.debug("Added note from %s to %s: %s", from, name, note);
  return irc.STATUS.STOP;
}

function load(bot) {
  bot.match(/^(?:(?!\bread\b).)*$/, notify);
  bot.match(/^:[!,./\?@`]tell\s+(\S+)\W?\s+(.+)\s*$/i, add.bind(null, bot));
  bot.match(/^:[!,./\?@`]read[\W\s]*$/i, read.bind(null, bot));

  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Tell";
exports.load    = load;
exports.unload  = unload;
