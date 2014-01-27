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
    , jwt = require('express-jwt')
    , app = express()
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
      }
    , seed = crypto.randomBytes(20)
    , nodeIdentifier = crypto
      .createHash('sha1')
      .update(seed)
      .digest('hex');

  /**
   *
   * Configuration
   *
   */
  app.disable('x-powered-by');
  app.use('/peer', jwt({
    secret: nodeIdentifier
  }));
  /*app.use(express.json());
  app.use(express.urlencoded());*/
  app.use(allowCrossDomain);

  /**
   *
   * Auth routes
   *
   */
  app.post('/auth', function (req, res) {
    res.send(OK, 'aaa');
/*    if (!(req.body.username === 'john.doe' && req.body.password === 'foobar')) {
      res.send(401, 'Wrong user or password');
      return;
    }

    var profile = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@doe.com',
      id: 123
    };

    var token = jwt.sign('clientNodeIdentifier',
      nodeIdentifier, {
        expiresInMinutes: 60*5
      });

    res.json({ token: token });*/
  });


  app.get('/', function(req, res) {
    res.json({data: nodeIdentifier});
  });

  app.listen(process.env.PORT, function() {
    console.log('bootstrap server listen on port ' + process.env.PORT);
  });
})();
