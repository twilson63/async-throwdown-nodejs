var http = require('http');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var knox = require('knox');
var s3 = knox.createClient(require('./config'));
var ee = new (require('events').EventEmitter);
var engine = require('engine.io');
var uuid = require('uuid');

var server = http.createServer(function(req, res) {
  if (req.url == '/js/engine.io.js' && req.method.toLowerCase() == 'get') {
    res.writeHead(200, { 'content-type': 'text/javascript'});
    fs.createReadStream('./engine.io.js').pipe(res);
    return;
  }
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    console.time('upload-file');
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.uploadDir = './uploads';
    form.keepExtensions = true;
    var name = uuid.v1();
    form.on('progress', function(bytesReceived, bytesExpected) {
      var status = { 
        name: name,
        percent: parseInt(
          (bytesReceived / bytesExpected) * 100, 10)
      };
      ee.emit('progress', status);
    });

    form.parse(req, function(err, fields, files) {
      console.log(err);
      console.log(files.upload.name);
      console.log(files.upload.path);
      
      // need to upload file to s3
      s3.putFile(files.upload.path, files.upload.name, function(e, r) {
        // remove file from tmp dir
        if (e) { 
          console.log(e);
          res.writeHead(500, {'content-type': 'text/plain'});
          res.write('error uploading file:\n\n');
          res.end(util.inspect({fields: fields, files: files}));
        }
        res.writeHead(200, {'content-type': 'text/html'});
        //res.write('received upload:\n\n');
        //res.end(files.upload.name);
        fs.createReadStream('./index.html').pipe(res);
        console.timeEnd('upload-file');
      })
      .on('progress', function(status) {
        status.name = files.upload.name;
        ee.emit('progress', status);
      });
    });

    return;
  }

  if (req.url === '/' || req.url === '/dashboard') {
    fs.createReadStream('./index.html').pipe(res);
    return;
  }

  streamFile('/components/angular/angular.js', 'text/javascript');
  streamFile('/components/angular-bootstrap/ui-bootstrap-tpls.js', 'text/javascript');
  streamFile('/components/bootstrap/docs/assets/css/docs.css', 'text/css');
  streamFile('/components/bootstrap/docs/assets/css/bootstrap.css', 'text/css');
  streamFile('/main.js', 'text/javascript');
  streamFile('/main.html', 'text/html');
  streamFile('/dashboard.html', 'text/html');
  
  function streamFile(url, type) {
    if (req.url == url) {
      res.writeHead(200, { 'content-type': type});
      fs.createReadStream('.' + url).pipe(res);
    }
  }
});

server.listen(8000);

var io = engine.attach(server);

io.on('connection', function(socket) {
  ee.on('progress', function(status) {
    socket.send(JSON.stringify(status));
  });
});

