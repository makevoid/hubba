(function (require) {
  'use strict';

  require('./rtc');

  var http = require('./http');
  http.listen(process.env.HTTP_PORT, function () {
    process.stdout.write('Bootstrap server listen http connections on port ' + process.env.HTTP_PORT + '\r\n');
  });
})(require);
