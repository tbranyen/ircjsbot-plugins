/**
 * @module 8ball
 */

const irc = require("irc-js");

const responses = [
  "it is certain",
  "it is decidedly so",
  "without a doubt",
  "yes — definitely",
  "you may rely on it",
  "as I see it, yes",
  "most likely",
  "outlook good",
  "yes",
  "signs point to yes",
  "reply hazy, try again",
  "ask again later",
  "better not tell you now",
  "cannot predict now",
  "concentrate and ask again",
  "don’t count on it",
  "my reply is no",
  "my sources say no",
  "outlook not so good",
  "very doubtful"
];

function getFortune(msg) {
  const index = Math.floor(responses.length * Math.random());
  msg.reply("%s.", responses[index]);
  return irc.STATUS.STOP;
}

function isForMe(msg) {
  return msg.params[1].indexOf(msg.client.user.nick) === 1;
}

function load(client) {
  client.match(/\?\s*$/, isForMe, getFortune);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "8ball";
exports.help    = "Ask a yes/no type question directed at the bot, get a response!";
exports.load    = load;
exports.unload  = unload;
