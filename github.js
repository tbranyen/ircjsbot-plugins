"use strict";

const irc     = require("irc-js");
const shared  = require("./shared");
const log     = irc.logger.get("ircjs-plugin-github");

const host    = "api.github.com";

function commit(msg, owner, project, sha) {
  log.debug("Fetching commit: %s", sha);
  const url = { hostname: host, path: "/repos/"+owner+"/"+project+"/git/commits/"+sha };
  shared.getJSON(url, function(data) {
    let ago = shared.timeAgo(new Date(data.author.date)).slice(0, 2).join(" ");
    msg.reply("%s (%s ago): %s", data.author.name, ago, data.message);
    return irc.STATUS.STOP;
  });
}

function issue(msg, owner, project, num) {
  log.debug("Fetching issue: %s on %s", num, project);
  const url = { hostname: host, path: "/repos/"+owner+"/"+project+"/issues/"+num };
  shared.getJSON(url, function(data) {
    let ago = shared.timeAgo(new Date(data.created_at)).slice(0, 2).join(" ");
    msg.reply("Issue #%d by %s (%s ago): %s", num, data.user.login, ago, data.title);
    return irc.STATUS.STOP;
  });
}

function pullRequest(msg, owner, project, num) {
  log.debug("Fetching pull requst: %s on %s", num, project);
  const url = { hostname: host, path: "/repos/"+owner+"/"+project+"/pulls/"+num };
  shared.getJSON(url, function(data) {
    let ago = shared.timeAgo(new Date(data.created_at)).slice(0, 2).join(" ");
    log.debug("pull data", data);
    msg.reply("Pull request #%d by %s (%s ago): %s", num, data.user.login, ago, data.title);
    return irc.STATUS.STOP;
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
