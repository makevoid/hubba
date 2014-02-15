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
    , OK = 200;

  var crypto = require('crypto')
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

  var redPeer = new wrtc.RTCPeerConnection(configuration, mediaConstraints)
    , blackPeer = new wrtc.RTCPeerConnection(configuration, mediaConstraints);

  var coolDump = function(a,b,c,d) {
        console.log(a,b,c,d);
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

  app.post('/', function(req, res) {
    var requesterNodeIdentifier = req.body.nodeIdentifier
      , remoteDescription = req.body.description;

    if(nodeIdentifier.localeCompare(requesterNodeIdentifier) === 0) {

      process.exit(1);
      throw 'Something very bad happen, two nodes with the same identifier...';
    } else if(nodeIdentifier.localeCompare(requesterNodeIdentifier) < 0) {
      //I'm smaller of requester -> he goes BLACK

      blackPeer.setRemoteDescription(new wrtc.RTCSessionDescription(remoteDescription),
        coolDump,
        coolDump);

      /*new wrtc.RTCSessionDescription(remoteDescription), function() {
        console.log('A');
      }, function() {
        console.log('B');
      });
      blackPeer.createAnswer(function(sdp) {

        res.json(sdp);
      }, function(a, b, c) {
        console.log('boom', a, b, c);
      });*/
    } else if(nodeIdentifier.localeCompare(requesterNodeIdentifier) > 0) {
      //I'm bigger of requester -> he goes RED

      redPeer.setRemoteDescription(new wrtc.RTCSessionDescription(remoteDescription),
        coolDump,
        coolDump);
    }
    res.send(OK);
  });

  app.listen(process.env.PORT, function() {
    console.log('bootstrap server listen on port ' + process.env.PORT);
  });
})();
