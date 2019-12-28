function fromcodepoint () {
  var stringFromCharCode = String.fromCharCode;
  var floor = Math.floor;
  var fromCodePoint = function (_) {
    var MAX_SIZE = 0x4000;
    var codeUnits = [];
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    var result = '';
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (
        !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
        codePoint < 0 || // not a valid Unicode code point
        codePoint > 0x10FFFF || // not a valid Unicode code point
        floor(codePoint) != codePoint // not an integer
      ) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) { // BMP code point
        codeUnits.push(codePoint);
      } else { // Astral code point; split in surrogate halves
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
      if (index + 1 == length || codeUnits.length > MAX_SIZE) {
        result += stringFromCharCode.apply(null, codeUnits);
        codeUnits.length = 0;
      }
    }
    return result;
  };
  String.prototype.fromCodePoint = fromCodePoint
}

function emojiToUnicode(emoji) {
  var backStr = ""
  if (emoji && emoji.length > 0) {
    for (var char of emoji) {
      var index = char.codePointAt(0)
      if (index > 65535) {
        var h = '\\u' + (Math.floor((index - 0x10000) / 0x400) + 0xD800).toString(16);
        var c = '\\u' + ((index - 0x10000) % 0x400 + 0xDC00).toString(16)
        backStr = backStr + h + c
      } else {
        backStr = backStr + char
      }
    }
  }
  return backStr
}

function toSurrogatePairs (index) {
  var h = '\\u' + (Math.floor((index - 0x10000) / 0x400) + 0xD800).toString(16);
  var c = '\\u' + ((index - 0x10000) % 0x400 + 0xDC00).toString(16)
  console.log(h + c)
  return h + c
}
// console.log(emojiToUnicode('😓'))
// emojiToUnicode('😀😀😀😀😀sdksk') // return '\ud83d\ude00\ud83d\ude00\ud83d\ude00\ud83d\ude00\ud83d\ude00sdks'

// toSurrogatePairs(128513)// return '\ud83d\ude01'
// toSurrogatePairs(0x1F601)// return '\ud83d\ude01'

// fromcodepoint()
// String.fromCodePoint(128513)// return '\ud83d\ude01'
