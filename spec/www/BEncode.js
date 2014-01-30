(function(angular) {
  'use strict';

  describe('BEncode', function() {
    console.info(' - Start BEncode Tests - ');
    beforeEach(angular.mock.module('HubbaNode'));

    it('should have a BEncode service', inject(['BEncode', function(BEncode) {


      expect(BEncode).toBeDefined();
    }]));

    it('BEncode encode on nothing', inject(['BEncode', function(BEncode) {

      expect(function() {
        BEncode.encode();
      }).toThrow('BEncode object needs an argument. Please provide this');
    }]));

    it('BEncode encode on undefined', inject(['BEncode', function(BEncode) {

      expect(function() {
        BEncode.encode(undefined);
      }).toThrow('BEncode object needs an argument. Please provide this');
    }]));

    it('BEncode encode string', inject(['BEncode', function(BEncode) {
      var stringToEncode = 'hello world!'
        , stringEncoded = BEncode.encode(stringToEncode);

      expect(stringEncoded).toEqual('12:hello world!');
    }]));

    it('BEncode encode number', inject(['BEncode', function(BEncode) {
      var numberToEncode = 1234567890
        , numberEncoded = BEncode.encode(numberToEncode);

      expect(numberEncoded).toEqual('i1234567890e');
    }]));

    it('BEncode encode list', inject(['BEncode', function(BEncode) {
      var listToEncode = [1, 'asdf', 32]
        , listEncoded = BEncode.encode(listToEncode);

      expect(listEncoded).toEqual('li1e4:asdfi32ee');
    }]));

    it('BEncode encode dictionary', inject(['BEncode', function(BEncode) {
      var dictionaryToEncode = {
        'first':123,
        'second': [1, 'asdf', 32],
        'third': 'asdf'
      }
        , dictionaryEncoded = BEncode.encode(dictionaryToEncode);

      expect(dictionaryEncoded).toEqual('d5:firsti123e6:secondli1e4:asdfi32ee5:third4:asdfe');
    }]));
  });
})(window.angular);
