(function (angular) {
  'use strict';

  angular.module('hubbaNode.services', [])

    .factory('SHA1', ['$window', function ($window) {
      var hexChars = '0123456789abcdef'
        , bitsInUTF8 = 8
        , hex = function (number) {
            var string = '';
            for (var i = bitsInUTF8 - 1; i >= 0; i -= 1) {

              string += hexChars.charAt((number >> (i * 4)) & 0x0F);
            }
            return string;
          }
        , stringToBlocks = function (string) {
            var stringLen = string.length
              , blocksNumber = ((stringLen + 8) >> 6) + 1
              , blocks = new Array(blocksNumber * 16)
              , index = 0;
            for (; index < blocksNumber * 16; index += 1) {

              blocks[index] = 0;
            }
            for (index = 0; index < stringLen; index += 1) {

              blocks[index >> 2] |= string.charCodeAt(index) << (24 - (index % 4) * 8);
            }
            blocks[index >> 2] |= 0x80 << (24 - (index % 4) * 8);
            blocks[blocksNumber * 16 - 1] = stringLen * 8;
            return blocks;
          }
        , add = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF)
              , msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
          }
        , rol = function (num, cnt) {

            return (num << cnt) | (num >>> (32 - cnt));
          }
        , ft = function (t, b, c, d) {
            if (t < 20) {

              return (b & c) | ((~b) & d);
            }

            if (t < 40) {

              return b ^ c ^ d;
            }

            if (t < 60) {

              return (b & c) | (b & d) | (c & d);
            }

            return b ^ c ^ d;
          }
        , kt = function (t) {
            if (t < 20) {

              return 1518500249;
            }

            if (t < 40) {

              return 1859775393;
            }

            if (t < 60) {

              return -1894007588;
            }

            return -899497514;
          }
        , SHA1FromByte = function (byteArray) {
            var string = '';
            for(var i = 0, byteArrayLen = byteArray.length; i < byteArrayLen; i += 1) {

              string += $window.String.fromCharCode(byteArray[i]);
            }
            return SHA1(string);
          }
        , SHA1 = function (string) {
            if (string !== '') {

              var w = new Array(80);
              var x = stringToBlocks(string);
              var a = 1732584193;
              var b = -271733879;
              var c = -1732584194;
              var d = 271733878;
              var e = -1009589776;

              for (var i = 0, xlen = x.length; i < xlen; i += 16) {

                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;

                for (var j = 0; j < 80; j += 1) {

                  if (j < 16) {

                    w[j] = x[i + j];
                  } else {

                    w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                  }
                  var t = add(add(rol(a, 5), ft(j, b, c, d)), add(add(e, w[j]), kt(j)));
                  e = d;
                  d = c;
                  c = rol(b, 30);
                  b = a;
                  a = t;
                }

                a = add(a, olda);
                b = add(b, oldb);
                c = add(c, oldc);
                d = add(d, oldd);
                e = add(e, olde);
              }

              return hex(a) + hex(b) + hex(c) + hex(d) + hex(e);
            } else {

              return 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
            }
          };

      return {
        SHA1FromByte : SHA1FromByte,
        SHA1 : SHA1
      };
    }])

    .factory('BEncode', ['$window', function ($window) {
      var BEncode = function (toDeserialize) {
        if (toDeserialize) {

          this._toDeserialize = toDeserialize;
        } else {

          throw 'To deserialize value must be provided.';
        }

        this.onlyEs = '^e+';
        this.stringLengthVar = /(\d+):/;
      };

      BEncode.encode = function (element) {
        if (element !== undefined) {

          var typeVal = $window.toString.call(element)
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

      BEncode.prototype.decode = function () {
        var startsWith = this._toDeserialize.substr(0, 1);
        if (startsWith === 'l') {

          this._toDeserialize = this._toDeserialize.substr(1);
          return this.listDecode();
        } else if (startsWith === 'd') {

          this._toDeserialize = this._toDeserialize.substr(1);
          return this.mapDecode();
        } else if (startsWith === 'i') {

          var retValue = this._toDeserialize.substr(1, this._toDeserialize.length - 2);
          return $window.Number(retValue).valueOf();
        } else {

          var delimeterIndex = this._toDeserialize.indexOf(':');
          return this._toDeserialize.substr(delimeterIndex + 1);
        }
      };

      BEncode.prototype.listDecode = function () {
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
            toReturn.push($window.Number(numberValue[1]).valueOf());
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

      BEncode.prototype.mapDecode = function () {
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
            tmpKey = $window.Number(numberValue[1]).valueOf();
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
            tmpValue = $window.Number(numberValue[1]).valueOf();
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

      BEncode.prototype.integerDecode = function () {
        var integerForm = /i(\d+|-\d+)e/;
        var numberValue = integerForm.exec(this._toDeserialize);
        return numberValue;
      };

      BEncode.prototype.stringDecode = function (stringLength) {
        var numStringLength = $window.Number(stringLength).valueOf()
          , stringLengthDelimiter = stringLength.split('').length + 1
          , toReturn = this._toDeserialize.substr(stringLengthDelimiter, numStringLength);
        this._toDeserialize = this._toDeserialize.substr(numStringLength + stringLengthDelimiter);
        return toReturn;
      };

      return BEncode;
    }])
})(window.angular);
