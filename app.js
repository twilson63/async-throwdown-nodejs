// max number of connections
var MAX_CONNECTIONS = 1000000;
// keep alive interval
var KEEPALIVE_INTERVAL = 2*60*1000;

var http   = require('http'),
  path     = require('path'),
  ee       = new (require('events').EventEmitter),
  engine   = require('engine.io'),
  upload   = require('./upload')(ee),
  filed    = require('filed'),
  //zlib     = require('zlib'),
  /* simple router for upload and dashboard route */
  router   = {
    post: { '/upload': upload },
    get: { '/dashboard': function(req, res) { 
      filed(path.join(__dirname, 'public', 'index.html'))
        .pipe(res); 
    }
  }
};

http.globalAgent.maxSockets = MAX_CONNECTIONS;

/* create server and handle request */
var server = http.createServer(function(req, res) {
  /* look for matched route in route obj */
  var fn = router[req.method.toLowerCase()][req.url];
  /* if found then call the route function */
  if (fn) { return fn(req, res); }
  /* otherwise pipe to filed and serve static files */
  req.pipe(filed(path.join(__dirname, 'public', req.url))).pipe(res);
  // if error shutdown server and restart
  req.on('error', function(err) {
    console.log(err);
    server.close();
    var endApp = function() { process.exit(1); }
    // wait 30sec for all connections to close
    setTimeout(endApp, 30000).unref();
  });
}).listen(process.env.PORT || 8000, function() {
  console.log('Server is Listening...(CTRL-C to close)');
});

// setup websockets to pass progress
engine.attach(server).on('connection', function(socket) {
  ee.on('progress', function(status) {
    socket.send(JSON.stringify(status));
  });
});