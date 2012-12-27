/** @module shared
 *  Stuff shared between multiple plugins.
 */

"use strict";

const redis = require("redis");
const https = require("https");
const fmt   = require("util").format;
const irc   = require("irc-js");

const log = irc.logger.get("ircjs-plugin-shared");

// Redis stuff
const TOKEN = "ff774f90da063a0dfa783172f16af4e3";
const HOST  = "46.38.167.162";
const PORT  = 6379;

// Redis events
const EVENT = {
  ERROR: "error"
};

// Redis status codes
const STATUS = {
  ERROR: 0,
  SUCCESS: 1
};

function getKey(object, prefix) {
  const id = object.id ? object.id : irc.id(object);
  const p  = prefix ? prefix : "IRCJS";
  return p + id;
}

const redisStuff =
  { EVENT:  EVENT
  , STATUS: STATUS
  , TOKEN:  TOKEN
  , HOST:   HOST
  , PORT:   PORT
  , key:    getKey
  }

function onRedisError(err) {
  log.error("Shared Redis client error: %s", err);
}

// Lazy Redis client getter
let redisClient = null;

Object.defineProperty(redisStuff, "client", {
  get: function() {
    if (!redisClient) {
      redisClient = redis.createClient(PORT, HOST);
      redisClient.auth(TOKEN);
      redisClient.on(redisStuff.EVENT.ERROR, onRedisError);
    }
    return redisClient;
  }
});

const times = [
  1000,       // Second
  60000,      // Minute
  3600000,    // Hour
  86400000,   // Day
  604800000,  // Week
  2629743830  // Month...ish
];            // Right square bracket

const labels = [
  "s",
  "m",
  "h",
  "d",
  "w",
  "mon"
];

/** Input a JS timestamp, get a nice string like "1h 2s".
 *  @param {Date|number}  t
 */
function timeAgo(t) {
  const out = [];
  let rem = Date.now() - t;
  let idx = times.length;
  let num = 0;
  if (rem < 0) {
    return "in the future!!";
  }
  else if (rem < times[0]) {
    return "now";
  }
  while (idx--) {
    num = ~~(rem/times[idx]);
    if (!num) {
      continue;
    }
    rem -= num * times[idx];
    out.push(num + labels[idx]);
  }
  out.splice(2);
  out.push("ago");
  return out.join(" ");
}

// Stuff for detecting bot-t.
const botT = irc.person("bot-t");
const botTPrefix = "?";

// Discard messages that bot-t responds to, if bot-t is present.
function forBotT(msg) {
  const chan  = irc.channel(irc.id(msg.params[0]));
  const wasIt = chan.people.has(botT.id) && msg.params[1].charAt(1) === botTPrefix;
  return wasIt;
}

function forMe(msg) {
  return !forBotT(msg) && msg.forMe;
}

function replaceEntity(input) {
  if (input.charAt(1) === '#') {
    return String.fromCharCode(parseInt(input.slice(2), 10));
  }
  const ent = ENTITIES.get(input);
  return ent ? ent : input;
}

function unescape(input) {
  return input.replace(/&(#?)(\d{1,5}|\w{1,8});/gm, replaceEntity);
}

// A couple of plugins do the same JSON-fetching over HTTPS.
function getJSON(url, cb) {
  https.get(url, function(res) {
    const data  = [];
    res.on(irc.NODE.SOCKET.EVENT.DATA, function(chunk) {
      data.push(chunk);
    });
    res.on(irc.NODE.SOCKET.EVENT.END, function() {
      try {
        let obj = JSON.parse(data.join(""));
        cb(obj);
      }
      catch (e) {
        log.error("Broken JSON from:", url, " -- ", data.join(""));
      }
    });
  });
}

// Text
const ENTITIES = new Map();
ENTITIES.set("&nbsp;", " ");
ENTITIES.set("&iexcl;", "¡");
ENTITIES.set("&cent;", "¢");
ENTITIES.set("&pound;", "£");
ENTITIES.set("&curren;", "¤");
ENTITIES.set("&yen;", "¥");
ENTITIES.set("&brvbar;", "¦");
ENTITIES.set("&sect;", "§");
ENTITIES.set("&uml;", "¨");
ENTITIES.set("&copy;", "©");
ENTITIES.set("&ordf;", "ª");
ENTITIES.set("&laquo;", "«");
ENTITIES.set("&not;", "¬");
ENTITIES.set("&shy;", "");
ENTITIES.set("&reg;", "®");
ENTITIES.set("&macr;", "¯");
ENTITIES.set("&deg;", "°");
ENTITIES.set("&plusmn;", "±");
ENTITIES.set("&sup2;", "²");
ENTITIES.set("&sup3;", "³");
ENTITIES.set("&acute;", "´");
ENTITIES.set("&micro;", "µ");
ENTITIES.set("&para;", "¶");
ENTITIES.set("&middot;", "·");
ENTITIES.set("&cedil;", "¸");
ENTITIES.set("&sup1;", "¹");
ENTITIES.set("&ordm;", "º");
ENTITIES.set("&raquo;", "»");
ENTITIES.set("&frac14;", "¼");
ENTITIES.set("&frac12;", "½");
ENTITIES.set("&frac34;", "¾");
ENTITIES.set("&iquest;", "¿");
ENTITIES.set("&Agrave;", "À");
ENTITIES.set("&Aacute;", "Á");
ENTITIES.set("&Acirc;", "Â");
ENTITIES.set("&Atilde;", "Ã");
ENTITIES.set("&Auml;", "Ä");
ENTITIES.set("&Aring;", "Å");
ENTITIES.set("&AElig;", "Æ");
ENTITIES.set("&Ccedil;", "Ç");
ENTITIES.set("&Egrave;", "È");
ENTITIES.set("&Eacute;", "É");
ENTITIES.set("&Ecirc;", "Ê");
ENTITIES.set("&Euml;", "Ë");
ENTITIES.set("&Igrave;", "Ì");
ENTITIES.set("&Iacute;", "Í");
ENTITIES.set("&Icirc;", "Î");
ENTITIES.set("&Iuml;", "Ï");
ENTITIES.set("&ETH;", "Ð");
ENTITIES.set("&Ntilde;", "Ñ");
ENTITIES.set("&Ograve;", "Ò");
ENTITIES.set("&Oacute;", "Ó");
ENTITIES.set("&Ocirc;", "Ô");
ENTITIES.set("&Otilde;", "Õ");
ENTITIES.set("&Ouml;", "Ö");
ENTITIES.set("&times;", "×");
ENTITIES.set("&Oslash;", "Ø");
ENTITIES.set("&Ugrave;", "Ù");
ENTITIES.set("&Uacute;", "Ú");
ENTITIES.set("&Ucirc;", "Û");
ENTITIES.set("&Uuml;", "Ü");
ENTITIES.set("&Yacute;", "Ý");
ENTITIES.set("&THORN;", "Þ");
ENTITIES.set("&szlig;", "ß");
ENTITIES.set("&agrave;", "à");
ENTITIES.set("&aacute;", "á");
ENTITIES.set("&acirc;", "â");
ENTITIES.set("&atilde;", "ã");
ENTITIES.set("&auml;", "ä");
ENTITIES.set("&aring;", "å");
ENTITIES.set("&aelig;", "æ");
ENTITIES.set("&ccedil;", "ç");
ENTITIES.set("&egrave;", "è");
ENTITIES.set("&eacute;", "é");
ENTITIES.set("&ecirc;", "ê");
ENTITIES.set("&euml;", "ë");
ENTITIES.set("&igrave;", "ì");
ENTITIES.set("&iacute;", "í");
ENTITIES.set("&icirc;", "î");
ENTITIES.set("&iuml;", "ï");
ENTITIES.set("&eth;", "ð");
ENTITIES.set("&ntilde;", "ñ");
ENTITIES.set("&ograve;", "ò");
ENTITIES.set("&oacute;", "ó");
ENTITIES.set("&ocirc;", "ô");
ENTITIES.set("&otilde;", "õ");
ENTITIES.set("&ouml;", "ö");
ENTITIES.set("&divide;", "÷");
ENTITIES.set("&oslash;", "ø");
ENTITIES.set("&ugrave;", "ù");
ENTITIES.set("&uacute;", "ú");
ENTITIES.set("&ucirc;", "û");
ENTITIES.set("&uuml;", "ü");
ENTITIES.set("&yacute;", "ý");
ENTITIES.set("&thorn;", "þ");
ENTITIES.set("&yuml;", "ÿ");
ENTITIES.set("&fnof;", "ƒ");
ENTITIES.set("&Alpha;", "Α");
ENTITIES.set("&Beta;", "Β");
ENTITIES.set("&Gamma;", "Γ");
ENTITIES.set("&Delta;", "Δ");
ENTITIES.set("&Epsilon;", "Ε");
ENTITIES.set("&Zeta;", "Ζ");
ENTITIES.set("&Eta;", "Η");
ENTITIES.set("&Theta;", "Θ");
ENTITIES.set("&Iota;", "Ι");
ENTITIES.set("&Kappa;", "Κ");
ENTITIES.set("&Lambda;", "Λ");
ENTITIES.set("&Mu;", "Μ");
ENTITIES.set("&Nu;", "Ν");
ENTITIES.set("&Xi;", "Ξ");
ENTITIES.set("&Omicron;", "Ο");
ENTITIES.set("&Pi;", "Π");
ENTITIES.set("&Rho;", "Ρ");
ENTITIES.set("&Sigma;", "Σ");
ENTITIES.set("&Tau;", "Τ");
ENTITIES.set("&Upsilon;", "Υ");
ENTITIES.set("&Phi;", "Φ");
ENTITIES.set("&Chi;", "Χ");
ENTITIES.set("&Psi;", "Ψ");
ENTITIES.set("&Omega;", "Ω");
ENTITIES.set("&alpha;", "α");
ENTITIES.set("&beta;", "β");
ENTITIES.set("&gamma;", "γ");
ENTITIES.set("&delta;", "δ");
ENTITIES.set("&epsilon;", "ε");
ENTITIES.set("&zeta;", "ζ");
ENTITIES.set("&eta;", "η");
ENTITIES.set("&theta;", "θ");
ENTITIES.set("&iota;", "ι");
ENTITIES.set("&kappa;", "κ");
ENTITIES.set("&lambda;", "λ");
ENTITIES.set("&mu;", "μ");
ENTITIES.set("&nu;", "ν");
ENTITIES.set("&xi;", "ξ");
ENTITIES.set("&omicron;", "ο");
ENTITIES.set("&pi;", "π");
ENTITIES.set("&rho;", "ρ");
ENTITIES.set("&sigmaf;", "ς");
ENTITIES.set("&sigma;", "σ");
ENTITIES.set("&tau;", "τ");
ENTITIES.set("&upsilon;", "υ");
ENTITIES.set("&phi;", "φ");
ENTITIES.set("&chi;", "χ");
ENTITIES.set("&psi;", "ψ");
ENTITIES.set("&omega;", "ω");
ENTITIES.set("&thetasym;", "ϑ");
ENTITIES.set("&upsih;", "ϒ");
ENTITIES.set("&piv;", "ϖ");
ENTITIES.set("&bull;", "•");
ENTITIES.set("&hellip;", "…");
ENTITIES.set("&prime;", "′");
ENTITIES.set("&Prime;", "″");
ENTITIES.set("&oline;", "‾");
ENTITIES.set("&frasl;", "⁄");
ENTITIES.set("&weierp;", "℘");
ENTITIES.set("&image;", "ℑ");
ENTITIES.set("&real;", "ℜ");
ENTITIES.set("&trade;", "™");
ENTITIES.set("&alefsym;", "ℵ");
ENTITIES.set("&larr;", "←");
ENTITIES.set("&uarr;", "↑");
ENTITIES.set("&rarr;", "→");
ENTITIES.set("&darr;", "↓");
ENTITIES.set("&harr;", "↔");
ENTITIES.set("&crarr;", "↵");
ENTITIES.set("&lArr;", "⇐");
ENTITIES.set("&uArr;", "⇑");
ENTITIES.set("&rArr;", "⇒");
ENTITIES.set("&dArr;", "⇓");
ENTITIES.set("&hArr;", "⇔");
ENTITIES.set("&forall;", "∀");
ENTITIES.set("&part;", "∂");
ENTITIES.set("&exist;", "∃");
ENTITIES.set("&empty;", "∅");
ENTITIES.set("&nabla;", "∇");
ENTITIES.set("&isin;", "∈");
ENTITIES.set("&notin;", "∉");
ENTITIES.set("&ni;", "∋");
ENTITIES.set("&prod;", "∏");
ENTITIES.set("&sum;", "∑");
ENTITIES.set("&minus;", "−");
ENTITIES.set("&lowast;", "∗");
ENTITIES.set("&radic;", "√");
ENTITIES.set("&prop;", "∝");
ENTITIES.set("&infin;", "∞");
ENTITIES.set("&ang;", "∠");
ENTITIES.set("&and;", "∧");
ENTITIES.set("&or;", "∨");
ENTITIES.set("&cap;", "∩");
ENTITIES.set("&cup;", "∪");
ENTITIES.set("&int;", "∫");
ENTITIES.set("&there4;", "∴");
ENTITIES.set("&sim;", "∼");
ENTITIES.set("&cong;", "≅");
ENTITIES.set("&asymp;", "≈");
ENTITIES.set("&ne;", "≠");
ENTITIES.set("&equiv;", "≡");
ENTITIES.set("&le;", "≤");
ENTITIES.set("&ge;", "≥");
ENTITIES.set("&sub;", "⊂");
ENTITIES.set("&sup;", "⊃");
ENTITIES.set("&nsub;", "⊄");
ENTITIES.set("&sube;", "⊆");
ENTITIES.set("&supe;", "⊇");
ENTITIES.set("&oplus;", "⊕");
ENTITIES.set("&otimes;", "⊗");
ENTITIES.set("&perp;", "⊥");
ENTITIES.set("&sdot;", "⋅");
ENTITIES.set("&lceil;", "⌈");
ENTITIES.set("&rceil;", "⌉");
ENTITIES.set("&lfloor;", "⌊");
ENTITIES.set("&rfloor;", "⌋");
ENTITIES.set("&lang;", "〈");
ENTITIES.set("&rang;", "〉");
ENTITIES.set("&loz;", "◊");
ENTITIES.set("&spades;", "♠");
ENTITIES.set("&clubs;", "♣");
ENTITIES.set("&hearts;", "♥");
ENTITIES.set("&diams;", "♦");
ENTITIES.set("&quot;", "\"");
ENTITIES.set("&amp;", "&");
ENTITIES.set("&lt;", "<");
ENTITIES.set("&gt;", ">");
ENTITIES.set("&OElig;", "Œ");
ENTITIES.set("&oelig;", "œ");
ENTITIES.set("&Scaron;", "Š");
ENTITIES.set("&scaron;", "š");
ENTITIES.set("&Yuml;", "Ÿ");
ENTITIES.set("&circ;", "ˆ");
ENTITIES.set("&tilde;", "˜");
ENTITIES.set("&ensp;", " ");
ENTITIES.set("&emsp;", " ");
ENTITIES.set("&thinsp;", " ");
ENTITIES.set("&zwnj;", "‌");
ENTITIES.set("&zwj;", "‍");
ENTITIES.set("&lrm;", "‎");
ENTITIES.set("&rlm;", "‏");
ENTITIES.set("&ndash;", "–");
ENTITIES.set("&mdash;", "—");
ENTITIES.set("&lsquo;", "‘");
ENTITIES.set("&rsquo;", "’");
ENTITIES.set("&sbquo;", "‚");
ENTITIES.set("&ldquo;", "“");
ENTITIES.set("&rdquo;", "”");
ENTITIES.set("&bdquo;", "„");
ENTITIES.set("&dagger;", "†");
ENTITIES.set("&Dagger;", "‡");
ENTITIES.set("&permil;", "‰");
ENTITIES.set("&lsaquo;", "‹");
ENTITIES.set("&rsaquo;", "›");
ENTITIES.set("&euro;", "€");

exports.forMe       = forMe;
exports.getJSON     = getJSON;
exports.redis       = redisStuff;
exports.timeAgo     = timeAgo;
exports.unescape    = unescape;
