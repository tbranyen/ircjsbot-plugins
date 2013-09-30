/** @module ideone */

"use strict";

const sys   = require("sys");
const http  = require("http");
const irc   = require("irc-js");

const METHOD_NOT_ALLOWED  = "Method Not Allowed\n";
const INVALID_REQUEST     = "Invalid Request\n";

const USER = "nlogax";
const PASS = "apanb0b";

const API_PATH = "/api/1/service.json";

var JSONRPCClient = function(port, host) {
  this.port = port;
  this.host = host;

  this.call = function(method, params, callback, errback, path) {
    const requestJSON = JSON.stringify({
      "id": Date.now().toString(),
      "method": method,
      "params": params
    });

    const headers = {
      "host": host,
      "Content-Length": requestJSON.length
    };

    if (!path) {
      path="/";
    }

    const options = {
      host: host,
      port: port,
      path: path,
      headers: headers,
      method: "POST"
    }

    const data = [];
    const req = http.request(options, function(res) {
      res.on("data", function(chunk) {
        data.push(chunk);
      });
      res.on("end", function() {
        var decoded;
        try {
          decoded = JSON.parse(data.join(""));
        } catch (e) {
          callback(e, null);
          return;
        }
        if (decoded.hasOwnProperty("result")) {
          callback(null, decoded.result);
        }
        else {
          callback(decoded.error, null);
        }
      });
      res.on("error", function(err) {
        callback(err, null);
      });
    });
    req.write(requestJSON);
    req.end();
  };
}

function JsonRpcWrapper() {
	this.client = new JSONRPCClient(80, "ideone.com");
	this.path = API_PATH;
	this.call = function(method, params, callback){
		this.client.call(method, params, callback, null, this.path);
	}
}

// ideone client
var ideone = new JsonRpcWrapper();

function wait(link, cb) {
	ideone.call("getSubmissionStatus", [USER, PASS, link], function(error, result){
		if (result["status"] != 0){
			setTimeout(function() { wait(link, cb); }, 1000);
		} else {
			getDetails(link, cb);
		}
	});
};

function getDetails(link, cb) {
	ideone.call("getSubmissionDetails",
      [USER, PASS, link, false, false, true, true, true],
      function(error, result){
		cb(result);
	});
}

function load(bot) {
  bot.match(/\b([a-z0-9\+#]{1,25})>\s+(.+)/i, function(msg, lang, code) {
    if (!(lang in languages)) {
      return;
    }
    lang = languages[lang];
    ideone.call("createSubmission", [USER, PASS, code, lang, "", true, false], function(error, result){
    	if (result["error"] == "OK"){
    		wait(result["link"], function(res) {
          if (!res["output"]) {
            msg.reply("No output.");
            return;
          }
          msg.reply(res.output);
        });
    	} else {
    		msg.reply(result["error"] + " :(((((");
    	}
    });    
    return irc.STATUS.STOP;
  });
  
  return irc.STATUS.SUCCESS;
}

function unload(bot) {
  return irc.STATUS.SUCCESS;
}

const languages = {
  "c++": "1",
  "cpp": "1",
  "pascal": "2",
  "pascal_gpc": "2",
  "perl": "3",
  "python": "4",
  "fortran": "5",
  "whitespace": "6",
  "ada": "7",
  "ocaml": "8",
  "intercal": "9",
  "java": "10",
  "c": "11",
  "brainfuck": "12",
  "assembler_nasm": "13",
  "clips": "14",
  "prolog_swi": "15",
  "icon": "16",
  "ruby": "17",
  "pike": "19",
  "haskell": "21",
  "hs": "21",
  "pascal_fpc": "22",
  "smalltalk": "23",
  "nice": "25",
  "lua": "26",
  "c#": "27",
  "bash": "28",
  "php": "29",
  "nemerle": "30",
  "common_lisp": "32",
  "cl": "32",
  "lisp": "32",
  "scheme": "33",
  "c99": "34",
  "javascript_rhino": "35",
  "erlang": "36",
  "tcl": "38",
  "scala": "39",
  "sql": "40",
  "objective-c": "43",
  "c++0x": "44",
  "cpp0x": "44",
  "assembler_gcc": "45",
  "assembler": "45",
  "asm": "45",
  "perl6": "54",
  "java7": "55",
  "text": "62",
  "vb.net": "101",
  "d": "102",
  "awk_gawk": "104",
  "awk_mawk": "105",
  "awk": "104",
  "cobol85": "106",
  "forth": "107",
  "prolog_gnu": "108",
  "prolog": "108",
  "bc": "110",
  "clojure": "111",
  "javascript_spidermonkey": "112",
  "javascript": "112",
  "js": "112",
  "go": "114",
  "unlambda": "115",
  "python3": "116",
  "r": "117",
  "cobol": "118",
  "oz": "119",
  "groovy": "121",
  "nimrod": "122",
  "factor": "123",
  "f#": "124",
  "falcon": "125"
};

exports.name    = "Ideone";
exports.load    = load;
exports.unload  = unload;
