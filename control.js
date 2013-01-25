/** @module control */

"use strict";

const irc     = require("irc-js");
const shared  = require("./shared");

const REMOVE  = irc.STATUS.REMOVE;
const STOP    = irc.STATUS.STOP;
const SUCCESS = irc.STATUS.SUCCESS;
const forMe   = shared.forMe;

function load(bot) {
  // Join a channel.
  bot.match(/\bjoin\s+(\S+)\s*$/i, forMe, function(msg, chan) {
    const from = msg.from.nick;
    if (bot.channels.has(irc.id(chan))) {
      msg.reply("I am already in " + chan + ".");
      return STOP;
    }
    // Reply when joined.
    bot.join(chan, function(chan, err) {
      if (err) {
        msg.reply("There was an error when I tried to join " + chan + ": " + err.message);
        return;
      }
      msg.reply("I am now in " + chan + ".");
    });
  });

  // Leave a channel.
  bot.match(/\b(?:part|leave)\s+(\S+)\s*$/i, forMe, function(msg, chan) {
    if (!bot.channels.has(irc.id(chan))) {
      msg.reply("I am not in %s.", chan);
      return STOP;
    }
    bot.part(chan);
    msg.reply("I have now left %s.", chan);
    return STOP;
  });

  // Say something.
  bot.match(/\bsay\s+(\S+)\s+(.+)*$/i, forMe, function(msg, chan, text) {
    const chanObj = bot.channels.get(irc.id(chan));
    if (chanObj) {
      chanObj.say(text);
    }
    else {
      msg.reply("I am not in %s.", chan);
    }
    return STOP;
  });

  // Quit.
  bot.match(/\bquit(?:\s+(.+))?\s*$/i, forMe, function(msg, reason) {
    bot.quit(reason ? reason : msg.from.nick + " told me to quit, bye!");
    return STOP | REMOVE;
  });

  // Get invited.
  bot.match(irc.COMMAND.INVITE, function(msg) {
    // Some clients send chan name as a trailing param :/
    bot.join(msg.params[1].replace(/^:/, ""), function(chan, err) {
      if (err) { return; }
      chan.say("Thanks for inviting me, " + msg.from.nick);
    });
    return STOP;
  });
  return SUCCESS;
}

function unload(bot) {
  return SUCCESS;
}

exports.name    = "Control";
exports.load    = load;
exports.unload  = unload;
