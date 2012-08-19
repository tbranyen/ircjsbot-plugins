/**
 * @module factoid
 */

"use strict";

const fmt     = require("util").format;
const irc     = require("irc-js");
const shared  = require("./shared");

const log   = irc.logger.get("ircjs-plugin-factoid");
const sKey  = "FACTOID";

// Factoids.

const redisClient = shared.redis.client;

function speak(msg, trigger, person) {
  redisClient.hget(sKey, trigger, function(err, res) {
    if (err) {
      log.error("Error hget:ing factoid: %s", err)
      return
    }
    if (!res) {
      return
    }
    msg.reply("%s, %s", person || msg.from.nick, res);
    return irc.STATUS.STOP;
  });
}

function learn(msg, key, value) {
  log.debug("factoid learn `%s`", key);
  redisClient.hset(sKey, key, value, function(err, res) {
    if (err) {
      log.error("learn factoid error: %s", err);
      return;
    }
    log.debug("Learned a new factoid: %s", key);
    msg.reply("%s, memorised “%s”.", msg.from.nick, key);
  });
}

function forget(msg, key) {
  log.debug("factoid forget `%s`", key);
  redisClient.hdel(sKey, key, function(err, res) {
    if (err) {
      log.error("forget factoid error: %s", err);
      return;
    }
    // Nothing was deleted
    if (res === 0) {
      msg.reply("%s, I can’t forget that which I do not know.", msg.from.nick);
      return;
    }
    const replyText = fmt("%s, I have forgotten “%s”%s", msg.from.nick, key,
      Math.random() > 0.5 ? ". My mind is going, I can feel it." : ".");
    msg.reply(replyText);
    log.debug("Happily forgot factoid: %s", key);
  });
}

// Implement Plugin interface.

function load(bot) {
  bot.match(/^:(?:\W|\S+\W?)?(\w\S+) +is[:,]? +(.+)/, shared.forMe, learn);
  bot.match(/\bforget\s+([-_.:|\/\\\w]+)$/, shared.forMe, forget);
  bot.match(/([-_.:|\/\\\w]+)(?:\s*@\s*([-\[\]\{\}`|_\w]+))?\s*$/,
    shared.forMe, speak);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "Factoid";
exports.load    = load;
exports.unload  = unload;
