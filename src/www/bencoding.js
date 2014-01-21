function BEncode(toDeserialize) {
  'use strict';

  if (toDeserialize) {

    this._toDeserialize = toDeserialize;
  } else {

    throw 'To deserialize value must be provided.';
  }

  this.onlyEs = '^e+';
  this.stringLengthVar = /(\d+):/;
}

BEncode.encode = function(element) {
  'use strict';
  if (element !== undefined) {

    var typeVal = window.toString.call(element)
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
};

BEncode.prototype.decode = function() {
  'use strict';

  var startsWith = this._toDeserialize.substr(0, 1);
  if (startsWith === 'l') {

    this._toDeserialize = this._toDeserialize.substr(1);
    return this.listDecode();
  } else if (startsWith === 'd') {

    this._toDeserialize = this._toDeserialize.substr(1);
    return this.mapDecode();
  } else if (startsWith === 'i') {

    var retValue = this._toDeserialize.substr(1, this._toDeserialize.length - 2);
    return Number(retValue).valueOf();
  } else {

    var delimeterIndex = this._toDeserialize.indexOf(':');
    return this._toDeserialize.substr(delimeterIndex + 1);
  }
};

BEncode.prototype.listDecode = function() {
  'use strict';

  var toReturn = [];
  do {

    var subElementStartsWith = this._toDeserialize.substr(0, 1);
    if (subElementStartsWith === 'l') {

      this._toDeserialize = this._toDeserialize.substr(1);
      toReturn.push(this.listDecode());
    } else if (subElementStartsWith === 'd') {

      this._toDeserialize = this._toDeserialize.substr(1);
      toReturn.push(this.mapDecode());
    } else if (subElementStartsWith === 'i') {

      var numberValue = this.integerDecode();
      toReturn.push(Number(numberValue[1]).valueOf());
      this._toDeserialize = this._toDeserialize.substr(numberValue[0].length);
    } else {

      var toDecode = this.stringLengthVar.exec(this._toDeserialize)[1];
      var stringValue = this.stringDecode(toDecode);
      toReturn.push(stringValue);
    }
  } while(this._toDeserialize.match(this.onlyEs) === null &&
    this._toDeserialize !== '');

  this._toDeserialize = this._toDeserialize.substr(1);
  return toReturn;
};

BEncode.prototype.mapDecode = function() {
  'use strict';

  var toReturn = {};
  do {

    var tmpKey
      , tmpValue
      , subElementStartsWith = this._toDeserialize.substr(0, 1)
      , numberValue
      , toDecode
      , stringValue;
    if (subElementStartsWith === 'l') {

      this._toDeserialize = this._toDeserialize.substr(1);
      tmpKey = this.listDecode();
    } else if (subElementStartsWith === 'd') {

      this._toDeserialize = this._toDeserialize.substr(1);
      tmpKey = this.mapDecode();
    } else if (subElementStartsWith === 'i') {

      numberValue = this.integerDecode();
      tmpKey = Number(numberValue[1]).valueOf();
      this._toDeserialize = this._toDeserialize.substr(numberValue[0].length);
    } else {

      toDecode = this.stringLengthVar.exec(this._toDeserialize)[1];
      stringValue = this.stringDecode(toDecode);
      tmpKey = stringValue;
    }

    subElementStartsWith = this._toDeserialize.substr(0, 1);
    if (subElementStartsWith === 'l') {

      this._toDeserialize = this._toDeserialize.substr(1);
      tmpValue = this.listDecode();
    } else if (subElementStartsWith === 'd') {

      this._toDeserialize = this._toDeserialize.substr(1);
      tmpValue = this.mapDecode();
    } else if (subElementStartsWith === 'i') {

      numberValue = this.integerDecode();
      tmpValue = Number(numberValue[1]).valueOf();
      this._toDeserialize = this._toDeserialize.substr(numberValue[0].length);
    } else {

      toDecode = this.stringLengthVar.exec(this._toDeserialize)[1];
      stringValue = this.stringDecode(toDecode);
      tmpValue = stringValue;
    }

    toReturn[tmpKey] = tmpValue;
  } while(this._toDeserialize.match(this.onlyEs) === null &&
    this._toDeserialize !== '');

  this._toDeserialize = this._toDeserialize.substr(1);
  return toReturn;
};

BEncode.prototype.integerDecode = function() {
  'use strict';

  var integerForm = /i(\d+|-\d+)e/;
  var numberValue = integerForm.exec(this._toDeserialize);
  return numberValue;
};

BEncode.prototype.stringDecode = function(stringLength) {
  'use strict';

  var numStringLength = Number(stringLength).valueOf()
    , stringLengthDelimiter = stringLength.split('').length + 1
    , toReturn = this._toDeserialize.substr(stringLengthDelimiter, numStringLength);
  this._toDeserialize = this._toDeserialize.substr(numStringLength + stringLengthDelimiter);
  return toReturn;
};
