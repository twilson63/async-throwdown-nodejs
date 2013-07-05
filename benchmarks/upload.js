var b = require('b');
var request = require('request');
var fs = require('fs');
var path = require('path');

b('make pretty and print to console').reporter('cli')

b('conncurrent upload benchmark').run(3, function(i, done) {
  var r = request.post('http://async.beautifulnode.com/upload');
  var form = r.form();
  var file3MB = 'OpenLabyrinth-v3-User-Guide.docx';
  var filePNG = 'screenshot.png';
  form.append('uploadFile', fs.createReadStream(path.join(__dirname, file3MB)));
  r.on('end', done);
});