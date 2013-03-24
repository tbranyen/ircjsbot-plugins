/** @module seen
 */

"use strict";

const fmt     = require("util").format;
const irc     = require("irc-js");
const shared  = require("./shared");

const log     = irc.logger.get("ircjs-plugin-seen");

const redisClient = shared.redis.client;

function seen(bot, msg, name, num) {
  const key = shared.redis.key(irc.id(name), "SEEN");
  // Bonus feature: ask for log entry at specific index
  const ix  = num ? num : 0;
  if (msg.from.nick === name) {
    msg.reply("I see you right now, here in %s.",
      bot.user.nick === msg.params[0] ? "our cozy private chat" : msg.params[0]);
    return irc.STATUS.STOP;
  }
  else if (bot.user.nick === name) {
    msg.reply("I am here with you in %s.",
      bot.user.nick === msg.params[0] ? "our sexy private chat" : msg.params[0]);
    return irc.STATUS.STOP;
  }

  redisClient.lindex(key, ix, function(err, res) {
    log.debug("Replying to `seen` inquiry");
    if (err) {
      msg.reply("I went to see, but there was an error: %s", err);
      log.debug("`seen` failed: %s", err);
      return;
    }
    if (!res) {
      msg.reply("I have never seen %s.", name);
      log.debug("Did not find any entries for %s", name);
      return;
    }
    const parts = res.match(/^(\d+)(.+)/);
    const date  = new Date(Number(parts[1]));
    const msg_  = irc.parser.parse(new Buffer(parts[2] + "\r\n"));
    const ago   = shared.timeAgo(date).slice(0, 2).join(" ");
    if (!msg_) {
      msg.reply("WTF, could not parse this: %s", parts[2]);
      return;
    }
    msg.reply("I saw " + name + " " + ago + " ago, " + describe(bot, msg_, msg));
  });

  return irc.STATUS.STOP;
}

function describe(bot, oldMsg, thisMsg) {
  const reply = [];
  switch (oldMsg.type) {
    case irc.COMMAND.PRIVMSG:
    if (oldMsg.params[0] === bot.user.nick) {
      reply.push("saying something to me in private.");
    }
    else {
      reply.push(fmt("%s %s, saying: %s",
        thisMsg.params[0] === oldMsg.params[0] ? "here in" : "in",
        oldMsg.params[0], oldMsg.params[1].slice(1)));
    }
    break;

    case irc.COMMAND.JOIN:
    reply.push(fmt("joining %s.", oldMsg.params[0]));
    break;

    case irc.COMMAND.PART:
    reply.push(fmt("leaving %s%s", oldMsg.params[0],
      oldMsg.params[1] ? " with the message: %s" + oldMsg.params[1].slice(1) : "."));
    break;

    case irc.COMMAND.QUIT:
    reply.push(fmt("quitting with the message: %s", oldMsg.params[0].slice(1)));
    break;

    case irc.COMMAND.NICK:
    reply.push(fmt("changing nick to %s.", oldMsg.params[0].replace(/^:/, "")));
    break;

    case irc.COMMAND.TOPIC:
    reply.push(fmt("changing the topic of %s to: %s", oldMsg.params[0],
      oldMsg.params[1].replace(/^:/, "")));
    break;

    default:
    reply.push("doing something I have no description for. The message was: " + oldMsg.toString());
    break;
  }
  return reply.join("");
}

function remember(msg) {
  if (!(msg.from instanceof irc.Person)) {
    return;
  }
  const key = shared.redis.key(msg.from.id, "SEEN");
  const val = Number(msg.date) + msg;
  redisClient.lpush(key, val);
}

function load(bot) {
  bot.match(irc.EVENT.ANY, remember);
  bot.match(/^:(?:\S+)?\W?\bseen\s+(\S+)\W?(?:\s+(\d+))?\s*$/i, shared.forMe, function(msg, nick, i) {
    return seen(bot, msg, nick, i);
  });

  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Seen";
exports.help    = "Ask the bot when it last saw someone with \"seen [nick]\". "
                + "Optionally you can ask for a log entry at a specific index with \"seen [nick] [idx]\".";
exports.load    = load;
exports.unload  = unload;
