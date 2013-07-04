var uuid = require('uuid');
var formidable = require('formidable');
var s3 = require('knox').createClient(require('./config'));

module.exports = function(ee) {
  return function(req, res) {
    // generate unique upload name
    var name = uuid.v1();
    var form = new formidable.IncomingForm();
    form.uploadDir = './uploads';
    form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
      if (err) { return sendErr(res); }
      res.writeHead(200, {'content-type': 'application/json'});
      res.end('{"ok": true }');

      s3.putFile(files.uploadFile.path, files.uploadFile.name, function(e, r) {
        // remove file from tmp dir
        if (e) { ee.emit('error', e);  }
      }).on('progress', function(status) {
        status.percent = (status.percent / 2) + 50;
        status.name = name;
        ee.emit('progress', status);
      });
    });
    form.on('progress', function uploadProgress(bytesReceived, bytesExpected) {
      ee.emit('progress', { name: name,
        percent: parseInt((bytesReceived / bytesExpected) * 100, 10) / 2
      });
    });
  };
};

function sendErr(res) {
  res.writeHead(500, {'content-type': 'text/plain'});
  res.end('error uploading file:\n\n');
}