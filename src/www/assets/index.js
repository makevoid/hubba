(function (angular) {
  'use strict';

  angular.module('hubbaNode', [
    'hubbaNode.providers',
    'hubbaNode.services',
    'hubbaNode.controllers'
  ])
    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.defaults.withCredentials = true;
    }])
    .run(['$window', '$http', '$rootScope', 'NodeIdentifier', function ($window, $http, $rootScope, NodeIdentifier) {
      $rootScope.nodeIdentifier = NodeIdentifier;
      $rootScope.bootstrapServer = 'http://localhost:3000';
      $rootScope.bootstrapWS = 'ws://localhost:3117';

      var ws = new $window.WebSocket($rootScope.bootstrapWS)
        , pendingOfferInOpeningWebSocket = []
        , pendingCandidateInOpeningWebSocket = [];
      $window.RTCPeerConnection = $window.mozRTCPeerConnection || $window.webkitRTCPeerConnection || $window.RTCPeerConnection;
      $window.RTCSessionDescription = $window.mozRTCSessionDescription || $window.RTCSessionDescription;
      $window.RTCIceCandidate = $window.mozRTCIceCandidate || $window.RTCIceCandidate;

      ws.onopen = function () {
        $window.console.info('WebSocket to', $rootScope.bootstrapWS, 'opened.');
        if (pendingOfferInOpeningWebSocket.length > 0) {

          for (var i = 0, pendingOfferInOpeningWebSocketLength = pendingOfferInOpeningWebSocket.length; i < pendingOfferInOpeningWebSocketLength; i += 1) {

            this.send(pendingOfferInOpeningWebSocket[i]);
          }
        }

        if (pendingCandidateInOpeningWebSocket.length > 0) {

          for (var d = 0, pendingCandidateInOpeningWebSocketLength = pendingCandidateInOpeningWebSocket.length; d < pendingCandidateInOpeningWebSocketLength; d += 1) {

            this.send(pendingCandidateInOpeningWebSocketLength[d]);
          }
        }
      };

      ws.onmessage = function (message) {

        var messageFromWs = JSON.parse(message.data);
        $window.console.trace('received: %s', messageFromWs.payloadType);
        if (messageFromWs.payloadType === 'offerResponse') {

          delete messageFromWs.payloadType;
          peerConnection.setRemoteDescription(new $window.RTCSessionDescription(messageFromWs)
            , function () {

              $window.console.info('waiting data channel...');
            }
            , function (err) {

              $window.console.error(err);
            });
        } else if (messageFromWs.payloadType === 'candidateResponse') {

          delete messageFromWs.payloadType;
          var candidate = new $window.RTCIceCandidate(messageFromWs.candidate);
          peerConnection.addIceCandidate(candidate);
        }
      };

      var configuration = {
          'iceServers': [
            {'url': 'stun:stun.l.google.com:19302'},
            {'url': 'stun:stunserver.org'}
          ]
        }
        , mediaConstraints = {
          optional: [
          ]
        }
        , peerConnection = new $window.RTCPeerConnection(configuration, mediaConstraints)
        , bootstapChannel = peerConnection.createDataChannel('bootstap', {
          reliable: {
            outOfOrderAllowed: false,
            maxRetransmitNum: 10
          }
        }, function (){
          $window.console.trace('channel callback');
        });

      //*
      bootstapChannel.binaryType = 'arraybuffer';
      bootstapChannel.onopen = function () {
        $window.console.trace('opened');
        var data = new Uint8Array([1, 2, 3, 4]);
        this.send(data.buffer);
      };
      bootstapChannel.onmessage = function (event) {
        var data = event.data;
        $window.console.trace('onmessage', data);
      };
      bootstapChannel.onclose = function (event) {
        $window.console.trace('onclose', event);
      };
      bootstapChannel.onerror = function (error) {
        throw error;
      };
      //*

      peerConnection.onsignalingstatechange = function (event) {
        $window.console.info('signaling state change: ', event.target.signalingState);
      };
      peerConnection.oniceconnectionstatechange = function (event) {
        $window.console.info('ice connection state change: ', event.target.iceConnectionState);
      };
      peerConnection.onicegatheringstatechange = function (event) {
        $window.console.info('ice gathering state change: ', event.target.iceGatheringState);
      };
      peerConnection.ondatachannel = function (event) {
        $window.console.info('data channel event: ', event);
      };

      peerConnection.onicecandidate = function (event) {
        var candidate = event.candidate;
        if(!candidate) {

          return;
        }

        var candidatePayload = JSON.stringify({
          'payloadType': 'candidate',
          'data': {
            'nodeIdentifier': $rootScope.nodeIdentifier,
            'candidate': candidate
          }
        });

        if (ws.readyState === $window.WebSocket.OPEN) {

          ws.send(candidatePayload);
        } else {

          pendingCandidateInOpeningWebSocket.push(candidatePayload);
        }
      };

      var sendOffer = function (offer) {
          var offerPayload = JSON.stringify({
            'payloadType': 'offer',
            'data': {
              'nodeIdentifier': $rootScope.nodeIdentifier,
              'description': {
                'type': offer.type,
                'sdp': offer.sdp
              }
            }
          });

          if(ws.readyState === $window.WebSocket.OPEN) {

            ws.send(offerPayload);
          } else {

            pendingOfferInOpeningWebSocket.push(offerPayload);
          }
        }
        , sendLocalDescription = function (desc) {
            peerConnection.setLocalDescription(new $window.RTCSessionDescription(desc),
            sendOffer.bind(undefined, desc),
            function (err) {
              throw err;
            });
          };

      peerConnection.createOffer(sendLocalDescription, function () {
        $window.console.error('Offer creation failed.');
      });
    }]);
})(window.angular);
