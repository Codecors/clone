var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app);
var fs = require('fs')
  , exec = require('child_process').exec;
var path = require('path');
var url = require("url");

var playingClip = false; // are we playing a proper clip?

app.listen(8002, "0.0.0.0");
console.log("listening");

var logFile = "./bbc.log";  // path is relative to where the command
                            // node path/server.js is given from


function handler (req, response) {
        // console.log(req.url);
        _url = url.parse(req.url, true);
        // console.log(url.parse(req.url, true));
        var loadFile =  '';
		var pathname = __dirname + _url.pathname;
		var extname = path.extname(pathname);
        if(req.url == '/dial'){
                loadFile = '/dial.html';
        }
        else if(req.url == '/wheel'){
                loadFile = '/emotion.html';
        }
        else{
                loadFile = _url.pathname;
        }
        console.log('reading file ' + loadFile);
        // fs.readFile(__dirname + '/index.html',
         fs.readFile(__dirname + loadFile,
           function (err, data) {
    if (err) {
            console.log(err);
      response.writeHead(500);
      return response.end('Error loading index.html');
    }

    response.writeHead(200);//, {'Content-Type': contentType});
    response.end(data);
    });
}

// listen for commands from control page
io.sockets.on('connection', function (socket) {

    socket.on('dial', function (data) {
            log("dial data: " + data.time + " - " + data.value);
        });

    socket.on('wheel', function (data) {
            log("wheel data: " + data.time + " - " + data.result);
        });


        // log something
        function log(message){
            var timestamp = new Date().getTime();
            var logEntry = timestamp + " " + message + "\n";
            console.log("log: " + logEntry);

            var log = fs.createWriteStream(logFile, {'flags': 'a'});
            log.write(logEntry);
        /*
          // newer version of node.js uses appendFile:
            fs.appendFile("/home/andy/bbc.log", logEntry, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("The file was saved!");
                    }
                });
        */
        }
    });
