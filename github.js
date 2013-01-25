"use strict";

const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-github");

const host    = "api.github.com";

function commit(msg, owner, project, sha) {
  log.debug("Fetching commit: %s", sha);
  const url = { hostname: host, path: "/repos/"+owner+"/"+project+"/git/commits/"+sha };
  shared.getJSON(url, function(data) {
    let ago = shared.timeAgo(new Date(data.author.date));
    msg.reply("%s (%s): %s", data.author.name, ago, data.message);
  });
}

function issue(msg, owner, project, num) {
  log.debug("Fetching issue: %s on %s", num, project);
  const url = { hostname: host, path: "/repos/"+owner+"/"+project+"/issues/"+num };
  shared.getJSON(url, function(data) {
    let ago = shared.timeAgo(new Date(data.created_at));
    msg.reply("Issue #%d by %s (%s): %s", num, data.user.login, ago, data.title);
  });
}

function pullRequest(msg, owner, project, num) {
  log.debug("Fetching pull requst: %s on %s", num, project);
  const url = { hostname: host, path: "/repos/"+owner+"/"+project+"/pulls/"+num };
  shared.getJSON(url, function(data) {
    let ago = shared.timeAgo(new Date(data.created_at));
    log.debug("pull data", data);
    msg.reply("Pull request #%d by %s (%s): %s", num, data.user.login, ago, data.title);
  });
}

function load(bot) {
  bot.match(/github\.com\/(.+?)\/(.+?)\/commit\/(\S+)/i, commit);
  bot.match(/github\.com\/(.+?)\/(.+?)\/issues\/(\d+)/i, issue);
  bot.match(/github\.com\/(.+?)\/(.+?)\/pull\/(\d+)/i, pullRequest);
  return irc.STATUS.SUCCESS;
}

function unload() {
  return irc.STATUS.SUCCESS;
}

exports.name    = "GitHub";
exports.load    = load;
exports.unload  = unload;
