'use strict';

/* global
    describe:false,
    beforeEach: false,
    it: false,
    expect: false,
    inject: false
*/

describe('SHA1', function() {
  console.info(' - Start SHA1 Tests - ');
  beforeEach(module('HubbaNode'));

  it('should have a SHA1 service', inject(function(SHA1) {


    expect(SHA1).toBeDefined();
  }));

  /*it('SHA1 empty string', function() {
    var sha1ed = SHA1.SHA1('');
    expect(sha1ed).toEqual('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  it('SHA1 for \'Cantami o diva del pelide Achille l\'ira funesta\'', function() {
    var sha1ed = SHA1.SHA1('Cantami o diva del pelide Achille l\'ira funesta');
    expect(sha1ed).toEqual('1f8a690b7366a2323e2d5b045120da7e93896f47');
  });

  it('SHA1 for \'Contami o diva del pelide Achille l\'ira funesta\'', function() {
    var sha1ed = SHA1.SHA1('Contami o diva del pelide Achille l\'ira funesta');
    expect(sha1ed).toEqual('e5f08d98bf18385e2f26b904cad23c734d530ffb');
  });

  it('SHA1 for \'The quick brown fox jumps over the lazy dog\'', function() {
    var sha1ed = SHA1.SHA1('The quick brown fox jumps over the lazy dog');
    expect(sha1ed).toEqual('2fd4e1c67a2d28fced849ee1bb76e7391b93eb12');
  });

  it('SHA1 for \'The quick brown fox jumps over the lazy cog\'', function() {
    var sha1ed = SHA1.SHA1('The quick brown fox jumps over the lazy cog');
    expect(sha1ed).toEqual('de9f2c7fd25e1b3afad3e85a0bd17d9b100db4b3');
  });*/
});
