(function (angular) {
  'use strict';

  angular.module('hubbaNode.controllers', [])
    .controller('TorrentFileUploadController', ['$scope', '$window', 'SHA1', 'BEncode', function ($scope, $window, SHA1Service, BencodeService) {
      $scope.torrentArrived = function (files) {

        var reader = new $window.FileReader()
          , blob;

        reader.onloadend = function (event) {

          if (event.target.readyState === $window.FileReader.DONE) {

            var valueFromFile = event.target.result;
            var ret = new BencodeService(valueFromFile).decode();
            var bEncoded = BencodeService.encode(ret.info);
            var infoHashed = SHA1Service.SHA1(bEncoded);

            console.log('metadata', ret);
            console.log('info_hash', infoHashed);
          }
        };

        for (var i = files.length - 1; i >= 0; i -= 1) {

          blob = files[i].slice();
          reader.readAsBinaryString(blob);
        }
      };
    }])
})(window.angular);
