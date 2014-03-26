(function() {
  'use strict';
  var COMMA_SPACE = ', '
    , CORS_ACAC = 'Access-Control-Allow-Credentials'
    , CORS_ACAO = 'Access-Control-Allow-Origin'
    , CORS_ACAM = 'Access-Control-Allow-Methods'
    , CORS_ACAH = 'Access-Control-Allow-Headers'
    , ORIGIN_HEADER = 'Origin'
    , CONTENT_TYPE_HEADER = 'Content-Type'
    , CONTENT_LENGTH_HEADER = 'Content-Length'
    , AUTHORIZATION_HEADER = 'Authorization'
    , ACCEPT_HEADER = 'Accept'
    , X_REQUEST_WITH_HEADER = 'X-Requested-With'
    , X_HTTP_METHOD_OVERRIDE_HEADER = 'X-HTTP-Method-Override'
    , GET_METHOD = 'GET'
    , PUT_METHOD = 'PUT'
    , POST_METHOD = 'POST'
    , DELETE_METHOD = 'DELETE'
    , OPTIONS_METHOD = 'OPTIONS'
    , ALLOWED_METHODS = GET_METHOD + COMMA_SPACE +
        PUT_METHOD + COMMA_SPACE +
        POST_METHOD + COMMA_SPACE +
        DELETE_METHOD + COMMA_SPACE +
        OPTIONS_METHOD
    , ALLOWED_HEADERS = ORIGIN_HEADER + COMMA_SPACE +
        ACCEPT_HEADER + COMMA_SPACE +
        CONTENT_TYPE_HEADER + COMMA_SPACE +
        AUTHORIZATION_HEADER + COMMA_SPACE +
        X_REQUEST_WITH_HEADER + COMMA_SPACE +
        X_HTTP_METHOD_OVERRIDE_HEADER + COMMA_SPACE +
        CONTENT_LENGTH_HEADER
    , OK = 200
    , KO = 400;

  var RSVP = require('rsvp')
    , crypto = require('crypto')
    , express = require('express')
    , app = express()
    , wrtc = require('wrtc')
    , allowCrossDomain = function(req, res, next) {
        res.header(CORS_ACAO, req.headers.origin);
        res.header(CORS_ACAC, true);
        res.header(CORS_ACAM, ALLOWED_METHODS);
        res.header(CORS_ACAH, ALLOWED_HEADERS);

        if (OPTIONS_METHOD === req.method) {

          res.send(OK);
        } else {

          next();
        }
      };

  var configuration = { 'iceServers': [
      {'url': 'stun:stun.l.google.com:19302'},
      {'url': 'stun:stunserver.org'}
    ]}
    , mediaConstraints = { optional: [
      { RtpDataChannels: true }
    ]}
    , nodeIdentifier = (function parseHexString() {
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
      })();

  var handleMessage = function(event) {
        console.log(event);
      }
    , handleReceiveChannelStateChange = function() {
        console.log(this.readyState);
      }
    , redPeer = new wrtc.RTCPeerConnection(configuration, mediaConstraints)
    , blackPeer = new wrtc.RTCPeerConnection(configuration, mediaConstraints)
    , redChannel
    , blackChannel
    , peerOccupiedBy = { red : undefined,
        black : undefined
      };

  redPeer.ondatachannel = function(event) {
    console.log(event);
    redChannel = event.channel;
    redChannel.onmessage = handleMessage;
    redChannel.onopen = handleReceiveChannelStateChange;
    redChannel.onclose = handleReceiveChannelStateChange;
  };
  redPeer.onicecandidate = function(event) {

    //send to caller of candidate (event.candidate);
  };

  blackPeer.ondatachannel = function(event) {
    console.log(event);
    blackChannel = event.channel;
    blackChannel.onmessage = handleMessage;
    blackChannel.onopen = handleReceiveChannelStateChange;
    blackChannel.onclose = handleReceiveChannelStateChange;
  };
  blackPeer.onicecandidate = function(event) {

    //send to caller of candidate (event.candidate);
  };

  var createABlackAnswer = function(requesterNodeIdentifier) {
      return new RSVP.Promise(function(resolve, reject) {
        blackPeer.createAnswer(function(sdp) {

          blackPeer.setLocalDescription(sdp);
          peerOccupiedBy.black = requesterNodeIdentifier;
          resolve(sdp);
        }, function(err) {

          reject(err);
        });
      });
    }
    , createARedAnswer = function(requesterNodeIdentifier) {
      return new RSVP.Promise(function(resolve, reject) {
        redPeer.createAnswer(function(sdp) {

          peerOccupiedBy.red = requesterNodeIdentifier;
          redPeer.setLocalDescription(sdp);
          resolve(sdp);
        }, function(err) {

          reject(err);
        });
      });
    };

  /**
   *
   * Configuration
   *
   */
  app.disable('x-powered-by');
  app.use(allowCrossDomain);
  app.use(express.urlencoded());
  app.use(express.json());

  app.post('/candidate', function(req, res) {
    var requesterNodeIdentifier = req.body.nodeIdentifier
      , candidate = JSON.parse(req.body.candidate);

    if (requesterNodeIdentifier === peerOccupiedBy.red) {

      redPeer.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
    } else if (requesterNodeIdentifier === peerOccupiedBy.black) {

      blackPeer.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
    } else {

      res.send(KO);
    }
  });

  app.post('/offer', function(req, res) {
    var requesterNodeIdentifier = req.body.nodeIdentifier
      , remoteDescription = JSON.parse(req.body.description);

    if(nodeIdentifier.localeCompare(requesterNodeIdentifier) === 0) {

      process.exit(1);
      throw 'Something very bad happen, two nodes with the same identifier...';
    } else if(nodeIdentifier.localeCompare(requesterNodeIdentifier) < 0 && !peerOccupiedBy.black) {
      //I'm smaller of requester -> he goes BLACK

      blackPeer.setRemoteDescription(new wrtc.RTCSessionDescription(remoteDescription));
      createABlackAnswer(requesterNodeIdentifier).then(function(successData) {

        res.json(successData);
      }, function(errorData) {

        res.json(KO, errorData);
      });
    } else if(nodeIdentifier.localeCompare(requesterNodeIdentifier) > 0 && !peerOccupiedBy.red) {
      //I'm bigger of requester -> he goes RED

      redPeer.setRemoteDescription(new wrtc.RTCSessionDescription(remoteDescription));
      createARedAnswer(requesterNodeIdentifier).then(function(successData) {

        res.json(successData);
      }, function(errorData) {

        res.json(KO, errorData);
      });
    } else {

      res.send(KO);
    }
  });

  app.listen(process.env.PORT, function() {
    console.log('bootstrap server listen on port ' + process.env.PORT);
  });
})();
