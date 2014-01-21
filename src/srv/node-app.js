(function() {
  'use strict';
  var express = require('express');
  var app = express();

  app.get('/', function(req, res) {
    res.send('aa');
  });

  app.listen(process.env.PORT);
})();
