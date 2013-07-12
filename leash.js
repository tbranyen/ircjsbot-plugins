/**
 * @module leash
 * Keeps your bot on a leash, by stopping it from talking to strangers (users 
 * who are not in an IRC channel the bot itself is already on).  This is useful
 * if you use the bot in a private channel on a public IRC server, and other 
 * users on the server are not trusted.  Since any user on IRC who knows a 
 * bot's IRC handle can interact with the bot in a private chat.
 */
"use strict";

const irc = require("irc-js");
const log = irc.logger.get("ircjs-plugin-leash");

function authenticate(msg) {
  // When the first param of a PRIVMSG is the bot's nick.
  console.log(arguments);
  if (msg.params[0] == msg.client.user.nick) {
    // Make sure the sending user is in the same channel by getting a list of
    // all users in each channel this bot is a part of and comparing.
    console.log(msg.from.nick);
    const chan  = this.channels.get(id(msg.params[2]));
    console.log(chan);
  }
}

function load(bot) {
  bot.match(irc.COMMAND.PRIVMSG, authenticate);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

/**
 * Implement plugin interface.
 */
exports.name = "Leash";
exports.help = "Keeps your bot on a leash, by stopping it from talking to "
              +"strangers (users who are not in an IRC channel the bot itself "
              +"is already on). This is useful if you use the bot in a private "
              +"channel on a public IRC server, and other users on the server "
              +"are not trusted. Since any user on IRC who knows a bot's IRC "
              +"handle can interact with the bot in a private chat. The "
              +"message that the bot responds to private messages from "
              +"strangers with can be modified or disabled on the bot settings "
              +"page, at <!url>.";
exports.load = load;
exports.unload = unload;