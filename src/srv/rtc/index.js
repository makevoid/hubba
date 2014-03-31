(function (require) {
  'use strict';

  var RSVP = require('rsvp')
    , crypto = require('crypto')
    , wrtc = require('wrtc')
    , WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: process.env.WS_PORT }, function () {
        process.stdout.write('Bootstrap server listen websocket connections on port ' + process.env.WS_PORT + '\r\n');
      });

  /**
   *
   * Configuration
   *
   */
  var nodeIdentifier = (function parseHexString() {
        var seed = crypto.randomBytes(20)
          , sha1Value = crypto.createHash('sha1').update(seed).digest('hex')
          , result = '';

        while (sha1Value.length >= 2) {

          var tmpValue = parseInt(sha1Value.substring(0, 2), 16).toString(2);
          if (tmpValue.length < 8) {

            var diff = 8 - tmpValue.length;
            for (var paddingIndex = 0; paddingIndex < diff; paddingIndex += 1) {

              tmpValue = '0' + tmpValue;
            }
          }
          result += tmpValue;
          sha1Value = sha1Value.substring(2, sha1Value.length);
        }
        return result;
      })()
    , configuration = { 'iceServers': [
      {'url': 'stun:stun.l.google.com:19302'},
      {'url': 'stun:stunserver.org'}
    ]}
    , mediaConstraints = { optional: [
      { RtpDataChannels: true }
    ]}
    , handleMessage = function (event) {
        console.info(event);
      }
    , handleReceiveChannelStateChange = function () {
        console.info('on[open|close] ', this.readyState);
      }
    , redPeer = new wrtc.RTCPeerConnection(configuration, mediaConstraints)
    , blackPeer = new wrtc.RTCPeerConnection(configuration, mediaConstraints)
    , redChannel
    , blackChannel
    , peerOccupiedBy = { red : undefined,
        black : undefined
      }
    , createABlackAnswer = function (requesterNodeIdentifier) {
        return new RSVP.Promise(function (resolve, reject) {
          blackPeer.createAnswer(function (sdp) {

            blackPeer.setLocalDescription(sdp);
            peerOccupiedBy.black = requesterNodeIdentifier;
            resolve(sdp);
          }, function (err) {

            reject(err);
          });
        });
      }
    , createARedAnswer = function (requesterNodeIdentifier) {
        return new RSVP.Promise(function (resolve, reject) {
          redPeer.createAnswer(function (sdp) {

            peerOccupiedBy.red = requesterNodeIdentifier;
            redPeer.setLocalDescription(sdp);
            resolve(sdp);
          }, function (err) {

            reject(err);
          });
        });
      }
    , handleOffer = function (offerData) {
        return new RSVP.Promise(function (resolve, reject) {
          var requesterNodeIdentifier = offerData.nodeIdentifier
            , remoteDescription = offerData.description;

          if(nodeIdentifier.localeCompare(requesterNodeIdentifier) === 0) {

            reject('Something very bad happen, two nodes with the same identifier.');
          } else if(nodeIdentifier.localeCompare(requesterNodeIdentifier) < 0 && !peerOccupiedBy.black) {
            //I'm smaller of requester -> he goes BLACK

            blackPeer.setRemoteDescription(new wrtc.RTCSessionDescription(remoteDescription));
            createABlackAnswer(requesterNodeIdentifier).then(function (successData) {

              resolve(successData);
            }, function (errorData) {

              reject(errorData);
            });
          } else if(nodeIdentifier.localeCompare(requesterNodeIdentifier) > 0 && !peerOccupiedBy.red) {
            //I'm bigger of requester -> he goes RED

            redPeer.setRemoteDescription(new wrtc.RTCSessionDescription(remoteDescription));
            createARedAnswer(requesterNodeIdentifier).then(function (successData) {

              resolve(successData);
            }, function (errorData) {

              reject(errorData);
            });
          } else {

            //TODO topology creation.
            console.info(nodeIdentifier.localeCompare(requesterNodeIdentifier) < 0 ? 'BLACK' : 'RED');
            if (nodeIdentifier.localeCompare(requesterNodeIdentifier) < 0) {
              //I need to be compared to the black one.

              if(requesterNodeIdentifier.localeCompare(peerOccupiedBy.black) < 0) {
                //case 1;
                console.log('CASE 1');
              }
            } else {
              //I need to be compared to the red one.

              console.info(requesterNodeIdentifier.localeCompare(peerOccupiedBy.red));
            }
            reject('If you see this there is a bug somewhere.');
          }
        });
      }
    , handleCandidate = function (candidateData) {
        var requesterNodeIdentifier = candidateData.nodeIdentifier
          , candidate = candidateData.candidate;

        if (requesterNodeIdentifier === peerOccupiedBy.red) {

          redPeer.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
        } else if (requesterNodeIdentifier === peerOccupiedBy.black) {

          blackPeer.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
        }
      };

  redPeer.ondatachannel = function (event) {
    redChannel = event.channel;
    redChannel.onmessage = handleMessage;
    redChannel.onopen = handleReceiveChannelStateChange;
    redChannel.onclose = handleReceiveChannelStateChange;
  };

  blackPeer.ondatachannel = function (event) {
    blackChannel = event.channel;
    blackChannel.onmessage = handleMessage;
    blackChannel.onopen = handleReceiveChannelStateChange;
    blackChannel.onclose = handleReceiveChannelStateChange;
  };

  wss.on('connection', function (ws) {
    redPeer.onicecandidate = function (event) {

      var iceCandidate = {};
      iceCandidate.payloadType = 'candidateResponse';
      iceCandidate.candidate = event.candidate;

      var candidateResponseJSON = JSON.stringify(iceCandidate);
      ws.send(candidateResponseJSON);
    };

    blackPeer.onicecandidate = function (event) {

      var iceCandidate = {};
      iceCandidate.payloadType = 'candidateResponse';
      iceCandidate.candidate = event.candidate;

      var candidateResponseJSON = JSON.stringify(iceCandidate);
      ws.send(candidateResponseJSON);
    };

    ws.on('message', function (message) {

      var messageFromWs = JSON.parse(message);
      process.stdout.write('received: ' + messageFromWs.payloadType + '\r\n');
      if (messageFromWs.payloadType === 'offer') {

        handleOffer(messageFromWs.data)
        .then(function (offerResponse) {

          offerResponse.payloadType = 'offerResponse';
          var offerResponseJSON = JSON.stringify(offerResponse);
          ws.send(offerResponseJSON);
        }).catch(function (error) {

          process.stderr.write(error + '\r\n');
        });
      } else if (messageFromWs.payloadType === 'candidate') {

        handleCandidate(messageFromWs.data);
      }
    });
  });
})(require, module);
