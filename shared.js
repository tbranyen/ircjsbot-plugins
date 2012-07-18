const fmt = require( "util" ).format
    , irc = require( "irc-js" )

// Redis stuff
const TOKEN = "ff774f90da063a0dfa783172f16af4e3"
    , HOST  = "127.0.0.1"
    , PORT  = 6379

// Redis events
const EVENT =
    { ERROR: "error"
    }

// Redis status codes
const STATUS =
    { ERROR: 0
    , SUCCESS: 1
    }

const getKey = function( nick, prefix ) {
  const id = nick instanceof irc.Person ? nick.id : new irc.Person( nick, null, null ).id
      , p = prefix || "IRCJS"
  return p + id
}

const times =
  [ 1000      // Second
  , 60000     // Minute
  , 3600000   // Hour
  , 86400000  // Day
  , 604800000 // Week
  ]           // Right square bracket

const labels = [ "s", "m", "h", "d", "w" ]

/** Input a JS timestamp, get a nice string like "1h 2s", which is the amount of time passed since then.
 *  @param {Date|number}  t     E.g. 1342489409837 from Date.now()
 */
const timeAgo = function( t ) {
  const out = []
  var rem = Date.now() - t
    , idx = times.length
    , cnt = 0
  while ( idx-- ) {
    cnt = ~~( rem / times[ idx ] )
    if ( cnt ) {
      rem -= cnt * times[ idx ]
      out.push( cnt + labels[ idx ] )
    }
  }
  return out.splice( 0, 2 ).join( ' ' )
}

exports.timeAgo = timeAgo

// Text

const ENTITIES =
  { '&nbsp;': ' '
  , '&iexcl;': '¡'
  , '&cent;': '¢'
  , '&pound;': '£'
  , '&curren;': '¤'
  , '&yen;': '¥'
  , '&brvbar;': '¦'
  , '&sect;': '§'
  , '&uml;': '¨'
  , '&copy;': '©'
  , '&ordf;': 'ª'
  , '&laquo;': '«'
  , '&not;': '¬'
  , '&shy;': ''
  , '&reg;': '®'
  , '&macr;': '¯'
  , '&deg;': '°'
  , '&plusmn;': '±'
  , '&sup2;': '²'
  , '&sup3;': '³'
  , '&acute;': '´'
  , '&micro;': 'µ'
  , '&para;': '¶'
  , '&middot;': '·'
  , '&cedil;': '¸'
  , '&sup1;': '¹'
  , '&ordm;': 'º'
  , '&raquo;': '»'
  , '&frac14;': '¼'
  , '&frac12;': '½'
  , '&frac34;': '¾'
  , '&iquest;': '¿'
  , '&Agrave;': 'À'
  , '&Aacute;': 'Á'
  , '&Acirc;': 'Â'
  , '&Atilde;': 'Ã'
  , '&Auml;': 'Ä'
  , '&Aring;': 'Å'
  , '&AElig;': 'Æ'
  , '&Ccedil;': 'Ç'
  , '&Egrave;': 'È'
  , '&Eacute;': 'É'
  , '&Ecirc;': 'Ê'
  , '&Euml;': 'Ë'
  , '&Igrave;': 'Ì'
  , '&Iacute;': 'Í'
  , '&Icirc;': 'Î'
  , '&Iuml;': 'Ï'
  , '&ETH;': 'Ð'
  , '&Ntilde;': 'Ñ'
  , '&Ograve;': 'Ò'
  , '&Oacute;': 'Ó'
  , '&Ocirc;': 'Ô'
  , '&Otilde;': 'Õ'
  , '&Ouml;': 'Ö'
  , '&times;': '×'
  , '&Oslash;': 'Ø'
  , '&Ugrave;': 'Ù'
  , '&Uacute;': 'Ú'
  , '&Ucirc;': 'Û'
  , '&Uuml;': 'Ü'
  , '&Yacute;': 'Ý'
  , '&THORN;': 'Þ'
  , '&szlig;': 'ß'
  , '&agrave;': 'à'
  , '&aacute;': 'á'
  , '&acirc;': 'â'
  , '&atilde;': 'ã'
  , '&auml;': 'ä'
  , '&aring;': 'å'
  , '&aelig;': 'æ'
  , '&ccedil;': 'ç'
  , '&egrave;': 'è'
  , '&eacute;': 'é'
  , '&ecirc;': 'ê'
  , '&euml;': 'ë'
  , '&igrave;': 'ì'
  , '&iacute;': 'í'
  , '&icirc;': 'î'
  , '&iuml;': 'ï'
  , '&eth;': 'ð'
  , '&ntilde;': 'ñ'
  , '&ograve;': 'ò'
  , '&oacute;': 'ó'
  , '&ocirc;': 'ô'
  , '&otilde;': 'õ'
  , '&ouml;': 'ö'
  , '&divide;': '÷'
  , '&oslash;': 'ø'
  , '&ugrave;': 'ù'
  , '&uacute;': 'ú'
  , '&ucirc;': 'û'
  , '&uuml;': 'ü'
  , '&yacute;': 'ý'
  , '&thorn;': 'þ'
  , '&yuml;': 'ÿ'
  , '&fnof;': 'ƒ'
  , '&Alpha;': 'Α'
  , '&Beta;': 'Β'
  , '&Gamma;': 'Γ'
  , '&Delta;': 'Δ'
  , '&Epsilon;': 'Ε'
  , '&Zeta;': 'Ζ'
  , '&Eta;': 'Η'
  , '&Theta;': 'Θ'
  , '&Iota;': 'Ι'
  , '&Kappa;': 'Κ'
  , '&Lambda;': 'Λ'
  , '&Mu;': 'Μ'
  , '&Nu;': 'Ν'
  , '&Xi;': 'Ξ'
  , '&Omicron;': 'Ο'
  , '&Pi;': 'Π'
  , '&Rho;': 'Ρ'
  , '&Sigma;': 'Σ'
  , '&Tau;': 'Τ'
  , '&Upsilon;': 'Υ'
  , '&Phi;': 'Φ'
  , '&Chi;': 'Χ'
  , '&Psi;': 'Ψ'
  , '&Omega;': 'Ω'
  , '&alpha;': 'α'
  , '&beta;': 'β'
  , '&gamma;': 'γ'
  , '&delta;': 'δ'
  , '&epsilon;': 'ε'
  , '&zeta;': 'ζ'
  , '&eta;': 'η'
  , '&theta;': 'θ'
  , '&iota;': 'ι'
  , '&kappa;': 'κ'
  , '&lambda;': 'λ'
  , '&mu;': 'μ'
  , '&nu;': 'ν'
  , '&xi;': 'ξ'
  , '&omicron;': 'ο'
  , '&pi;': 'π'
  , '&rho;': 'ρ'
  , '&sigmaf;': 'ς'
  , '&sigma;': 'σ'
  , '&tau;': 'τ'
  , '&upsilon;': 'υ'
  , '&phi;': 'φ'
  , '&chi;': 'χ'
  , '&psi;': 'ψ'
  , '&omega;': 'ω'
  , '&thetasym;': 'ϑ'
  , '&upsih;': 'ϒ'
  , '&piv;': 'ϖ'
  , '&bull;': '•'
  , '&hellip;': '…'
  , '&prime;': '′'
  , '&Prime;': '″'
  , '&oline;': '‾'
  , '&frasl;': '⁄'
  , '&weierp;': '℘'
  , '&image;': 'ℑ'
  , '&real;': 'ℜ'
  , '&trade;': '™'
  , '&alefsym;': 'ℵ'
  , '&larr;': '←'
  , '&uarr;': '↑'
  , '&rarr;': '→'
  , '&darr;': '↓'
  , '&harr;': '↔'
  , '&crarr;': '↵'
  , '&lArr;': '⇐'
  , '&uArr;': '⇑'
  , '&rArr;': '⇒'
  , '&dArr;': '⇓'
  , '&hArr;': '⇔'
  , '&forall;': '∀'
  , '&part;': '∂'
  , '&exist;': '∃'
  , '&empty;': '∅'
  , '&nabla;': '∇'
  , '&isin;': '∈'
  , '&notin;': '∉'
  , '&ni;': '∋'
  , '&prod;': '∏'
  , '&sum;': '∑'
  , '&minus;': '−'
  , '&lowast;': '∗'
  , '&radic;': '√'
  , '&prop;': '∝'
  , '&infin;': '∞'
  , '&ang;': '∠'
  , '&and;': '∧'
  , '&or;': '∨'
  , '&cap;': '∩'
  , '&cup;': '∪'
  , '&int;': '∫'
  , '&there4;': '∴'
  , '&sim;': '∼'
  , '&cong;': '≅'
  , '&asymp;': '≈'
  , '&ne;': '≠'
  , '&equiv;': '≡'
  , '&le;': '≤'
  , '&ge;': '≥'
  , '&sub;': '⊂'
  , '&sup;': '⊃'
  , '&nsub;': '⊄'
  , '&sube;': '⊆'
  , '&supe;': '⊇'
  , '&oplus;': '⊕'
  , '&otimes;': '⊗'
  , '&perp;': '⊥'
  , '&sdot;': '⋅'
  , '&lceil;': '⌈'
  , '&rceil;': '⌉'
  , '&lfloor;': '⌊'
  , '&rfloor;': '⌋'
  , '&lang;': '〈'
  , '&rang;': '〉'
  , '&loz;': '◊'
  , '&spades;': '♠'
  , '&clubs;': '♣'
  , '&hearts;': '♥'
  , '&diams;': '♦'
  , '&quot;': '"'
  , '&amp;': '&'
  , '&lt;': '<'
  , '&gt;': '>'
  , '&OElig;': 'Œ'
  , '&oelig;': 'œ'
  , '&Scaron;': 'Š'
  , '&scaron;': 'š'
  , '&Yuml;': 'Ÿ'
  , '&circ;': 'ˆ'
  , '&tilde;': '˜'
  , '&ensp;': ' '
  , '&emsp;': ' '
  , '&thinsp;': ' '
  , '&zwnj;': '‌'
  , '&zwj;': '‍'
  , '&lrm;': '‎'
  , '&rlm;': '‏'
  , '&ndash;': '–'
  , '&mdash;': '—'
  , '&lsquo;': '‘'
  , '&rsquo;': '’'
  , '&sbquo;': '‚'
  , '&ldquo;': '“'
  , '&rdquo;': '”'
  , '&bdquo;': '„'
  , '&dagger;': '†'
  , '&Dagger;': '‡'
  , '&permil;': '‰'
  , '&lsaquo;': '‹'
  , '&rsaquo;': '›'
  , '&euro;': '€'
  }

const replaceEntity = function( input ) {
  if ( input.charAt(1) === '#' )
    return String.fromCharCode( parseInt( input.substr(2), 10 ) )
  else if ( ENTITIES.hasOwnProperty( input ) )
    return ENTITIES[ input ]
}

const unescape = function( input ) {
  return input.replace( /&(#?)(\d{1,5}|\w{1,8});/gm, replaceEntity )
}

exports.unescape = unescape

// Go go go

exports.redis =
  { EVENT:  EVENT
  , STATUS: STATUS
  , TOKEN:  TOKEN
  , HOST:   HOST
  , PORT:   PORT
  , key:    getKey
  }
