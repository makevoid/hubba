'use strict';

window.BEncode = (function() {
  var onlyEs = '^e+'
  , stringLengthVar = /(\d+):/
  , _toDeserialize
  , listDecode = function() {

    var toReturn = [];
    do {

      var subElementStartsWith = BEncode._toDeserialize.substr(0, 1);
      if (subElementStartsWith === 'l') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        toReturn.push(listDecode());
      } else if (subElementStartsWith === 'd') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        toReturn.push(mapDecode());
      } else if (subElementStartsWith === 'i') {

        var numberValue = integerDecode();
        toReturn.push(Number(numberValue[1]).valueOf());
        BEncode._toDeserialize = BEncode._toDeserialize.substr(numberValue[0].length);
      } else {

        var toDecode = stringLengthVar.exec(BEncode._toDeserialize)[1];
        var stringValue = stringDecode(toDecode);
        toReturn.push(stringValue);
      }
    } while(BEncode._toDeserialize.match(onlyEs) === null &&
      BEncode._toDeserialize !== '');

    BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
    return toReturn;
  }
  , mapDecode = function() {

    var toReturn = {};
    do {

      var tmpKey
        , tmpValue
        , subElementStartsWith = BEncode._toDeserialize.substr(0, 1)
        , numberValue
        , toDecode
        , stringValue;
      if (subElementStartsWith === 'l') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        tmpKey = listDecode();
      } else if (subElementStartsWith === 'd') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        tmpKey = mapDecode();
      } else if (subElementStartsWith === 'i') {

        numberValue = integerDecode();
        tmpKey = Number(numberValue[1]).valueOf();
        BEncode._toDeserialize = BEncode._toDeserialize.substr(numberValue[0].length);
      } else {

        toDecode = stringLengthVar.exec(BEncode._toDeserialize)[1];
        stringValue = stringDecode(toDecode);
        tmpKey = stringValue;
      }

      subElementStartsWith = BEncode._toDeserialize.substr(0, 1);
      if (subElementStartsWith === 'l') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        tmpValue = listDecode();
      } else if (subElementStartsWith === 'd') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        tmpValue = mapDecode();
      } else if (subElementStartsWith === 'i') {

        numberValue = integerDecode();
        tmpValue = Number(numberValue[1]).valueOf();
        BEncode._toDeserialize = BEncode._toDeserialize.substr(numberValue[0].length);
      } else {

        toDecode = stringLengthVar.exec(BEncode._toDeserialize)[1];
        stringValue = stringDecode(toDecode);
        tmpValue = stringValue;
      }

      toReturn[tmpKey] = tmpValue;
    } while(BEncode._toDeserialize.match(onlyEs) === null &&
      BEncode._toDeserialize !== '');

    BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
    return toReturn;
  }
  , integerDecode = function() {
    var integerForm = /i(\d+|-\d+)e/;
    var numberValue = integerForm.exec(BEncode._toDeserialize);
    return numberValue;
  }
  , stringDecode = function(stringLength) {

    var numStringLength = Number(stringLength).valueOf()
      , stringLengthDelimiter = stringLength.split('').length + 1
      , toReturn = BEncode._toDeserialize.substr(stringLengthDelimiter, numStringLength);
    BEncode._toDeserialize = BEncode._toDeserialize.substr(numStringLength + stringLengthDelimiter);
    return toReturn;
  };

  var encode = function(element) {
    if (element !== undefined) {

      var typeVal = toString.call(element)
        , toReturn;
      if (typeVal === '[object String]') {

        return element.length + ':' + element;
      } else if (typeVal === '[object Number]') {

        return 'i' + element + 'e';
      } else if (typeVal === '[object Array]' ||
        typeVal === '[object Uint8ClampedArray]' ||
        typeVal === '[object Uint8Array]' ||
        typeVal === '[object Uint16Array]' ||
        typeVal === '[object Uint32Array]') {

        toReturn = 'l';
        for (var i = 0, listLength = element.length; i < listLength; i += 1) {

          toReturn += BEncode.encode(element[i]);
        }
        toReturn += 'e';
        return toReturn;
      } else if (typeVal === '[object Object]') {

        toReturn = 'd';
        for (var key in element) {

          if (element.hasOwnProperty(key)) {

            toReturn += BEncode.encode(key) + BEncode.encode(element[key]);
          }
        }
        toReturn += 'e';
        return toReturn;
      } else {

        throw 'Can not serialize.';
      }
    } else {

      throw 'BEncode object needs an argument. Please provide this';
    }
  }
  , decode = function(toDeserialize) {
    if (toDeserialize) {

      BEncode._toDeserialize = toDeserialize;
      var startsWith = BEncode._toDeserialize.substr(0, 1);
      if (startsWith === 'l') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        return listDecode();
      } else if (startsWith === 'd') {

        BEncode._toDeserialize = BEncode._toDeserialize.substr(1);
        return mapDecode();
      } else if (startsWith === 'i') {

        var retValue = BEncode._toDeserialize.substr(1, BEncode._toDeserialize.length - 2);
        return Number(retValue).valueOf();
      } else {

        var delimeterIndex = BEncode._toDeserialize.indexOf(':');
        return BEncode._toDeserialize.substr(delimeterIndex + 1);
      }
    } else {

      throw 'To deserialize value must be provided.';
    }
  };

  return {

    decode : decode,
    encode : encode
  };
})();
