/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , read = require('fs').createReadStream
  , binaryjs = require('binaryjs');

var app = express()
  , theFile = '/dev/random'
  , streams = 0
  , server, httpServer;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
});

app.get('/', routes.index);
app.get('/browser', routes.browser);

httpServer = http.createServer(app);
httpServer.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Binary server stuff
server = binaryjs.BinaryServer({ server: httpServer });

server.on('connection', function (client) {
  var stream = read(theFile, { bufferSize: 128 });

  console.log(++streams + " open");

  // Start sending /dev/random
  client.send(stream);

  // Close the stream when they disconnect
  client.on('close', function () {
    stream.destroy();
    console.log(--streams + " open");
  });
});