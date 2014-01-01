window.BEncode = (function() {
  var listDecode = function(toDeserialize) {

    var toReturn = [];
    toDeserialize = toDeserialize.substr(1);
    do {

      var subelementStartsWith = toDeserialize.substr(0, 1);
      if (subelementStartsWith === 'l') {

        toDeserialize = toDeserialize.substr(1);
        toReturn.push(listDecode(toDeserialize));

        toDeserialize = 'e';
      } else if (subelementStartsWith === 'd') {

        toDeserialize = toDeserialize.substr(1);
        toReturn.push(mapDecode(toDeserialize));

        toDeserialize = 'e';
      } else if (subelementStartsWith === 'i') {

        var numberValue = integerDecode(toDeserialize);
        toReturn.push(new Number(numberValue[1]).valueOf());
        toDeserialize = toDeserialize.substr(numberValue[0].length);
      } else {

        var stringValue = stringDecode(toDeserialize, subelementStartsWith);
        toReturn.push(stringValue);
        toDeserialize = toDeserialize.substr(stringValue.length + 2);
      };
    } while(toDeserialize.length !== 1 &&
      toDeserialize !== 'e');

    return toReturn;
  }
  , mapDecode = function(toDeserialize) {

    var toReturn = {};
    console.log(toDeserialize);
    return toDeserialize;
  }
  , integerDecode = function(toDeserialize) {
    var integerForm = /i(\d+|-\d+)e/;
    var numberValue = integerForm.exec(toDeserialize);
    return numberValue;
  }
  , stringDecode = function(toDeserialize, stringLength) {
    return toDeserialize.substr(2, stringLength);
  };

  var encode = function(element) {
      if (element) {

        var typeVal = toString.call(element);
        if (typeVal === '[object String]') {

          return element.length + ':' + element;
        } else if (typeVal === '[object Number]') {

          return 'i' + element + 'e';
        } else if (typeVal === '[object Array]' ||
          typeVal === '[object Uint8ClampedArray]' ||
          typeVal === '[object Uint8Array]' ||
          typeVal === '[object Uint16Array]' ||
          typeVal === '[object Uint32Array]') {

          var toReturn = 'l';
          for (var i = 0, listLength = element.length; i < listLength; ++i) {

            toReturn += BEncode.encode(element[i]);
          };
          toReturn += 'e';
          return toReturn;
        } else if (typeVal === '[object Object]') {

          var toReturn = 'd';
          for (var key in element) {

            if (element.hasOwnProperty(key)) {

              toReturn += key + ':' + BEncode.encode(element[key]);
            }
          }
          toReturn += 'e';
          return toReturn;
        } else {

          throw 'Can not serialize.';
        };
      } else {

        throw 'BEncode object needs an argument. Please provide this';
      };
    }
    , decode = function(toDeserialize) {
      if (toDeserialize) {

        var startsWith = toDeserialize.substr(0, 1);
        if (startsWith === 'l') {

          return listDecode(toDeserialize);
        } else if (startsWith === 'd') {

        } else if (startsWith === 'i') {

          var retValue = toDeserialize.substr(1, toDeserialize.length - 2)
          return new Number(retValue).valueOf();
        } else {

          var delimeterIndex = toDeserialize.indexOf(':');
          return toDeserialize.substr(delimeterIndex + 1);
        };
      } else {

        throw 'To deserialize value must be provided.'
      };
    };

  return {

    decode : decode,
    encode : encode
  };
})();
