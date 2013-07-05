var b = require('b');
var request = require('request');
var path = require('path');

b('make pretty and print to console').reporter('cli')

b('conncurrent upload benchmark').run(100, function(i, done) {
  request.get('http://async.beautifulnode.com', done);
});