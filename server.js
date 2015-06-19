/*
 * Nodejs server for handling emotion wheel and dial testing
 *
 * Andy Brown.
 * andy.brown01@bbc.co.uk
 * BBC R&D. June 2015
 *
 */

var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app);
var fs = require('fs')
  , exec = require('child_process').exec;
var path = require('path');
var url = require("url");

var sessions = [];

var playingClip = false; // are we playing a proper clip?

app.listen(8002, "0.0.0.0");
console.log("listening");


// set up logging
// path is relative to where the command node path/server.js is given from
var logFile = "./engagement.log";
try{
    var logstream = fs.createWriteStream(logFile, {'flags': 'a'});
}
catch(e){
    console.log("couldn't create write stream for log");
}

// routing function
function handler (req, response) {
        _url = url.parse(req.url, true);
        // console.log(_url);
        // console.log(url.parse(req.url, true));
        var loadFile =  '';
		var pathname = __dirname + _url.pathname;
		var extname = path.extname(pathname);

        // sort content type (without this, stuff like SVG not handled
        // properly in browser)
        var contentType = 'text/html';
        switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
			case '.svg':
			case '.TTF':
				contentType = 'image/svg+xml';
				break;
        }

        // routing
        if(_url.pathname == '/dial'){
                loadFile = '/dialSVG.html';
        }
        else if(_url.pathname === '/wheel'){
                loadFile = '/emotion.html';
        }
        else if(_url.pathname == '/remote' || _url.pathname == '/control'){
                loadFile = '/control.html';
        }
        else if(_url.pathname === '/start' || _url.pathname === '/'){
                loadFile = '/start.html';
        }
        else{
                loadFile = _url.pathname;
        }

        // read file and send response
        fs.readFile(__dirname + loadFile,
           function (err, data) {
                if (err) {
                    console.log(err);
                    response.writeHead(500);
                    return response.end('Error loading ' + req.url);
                }

                response.writeHead(200, {'Content-Type': contentType});
                response.end(data);
            });
}

// listen for commands from control page
io.sockets.on('connection', function (socket) {

    // cnotrol page has asked to change participants to a new page
    // pass on requests to all clients
    socket.on('static', function (data) {
            // broadcast change - only those with correct guid will respond
            console.log("changing page to" + data.url);
            log("loading static page index: " + data.url);
            socket.broadcast.emit('static', data);
        });


    // guid wanted - generate and return
    socket.on('guid', function (data) {
        var guid = generateGuid();
        socket.emit('guid', { "value": guid });
    });


    // session wanted from user
    socket.on('getSession', function (data) {
        var s = getSessionForUser(data.guid);
        socket.emit('isSession', { "sid": s });
    });

    // new session created
    socket.on('newsession', function(data) {
        var sid = data.sessionid;
        var sess = new Session(sid);
        sessions.push(sess);
        log('new session: ' + sid)
    });

    // request for list of sessions
    socket.on('sessions', function(data){
        var ids = [];
        for(var i = 0; i< sessions.length; i++){
            ids.push(sessions[i].id);
        }
        socket.emit('sessionlist', {'list': ids});
    })

    // start - new user registered - notify control page
    socket.on('start', function (data) {
        // console.log(data.pid + " is " + data.guid);
        var session = data.session;
        for (var i = 0; i < sessions.length; i++){
            if (sessions[i].id === session){
                var user = new User(data.guid, data.pid);
                sessions[i].users.push(user);
            }
        }
        socket.broadcast.emit('newuser', data); // tell control page
    });


    // received data - store
    socket.on('dial', function (data) {
            var user = data.pid + " " + data.guid;
            log(user + " " + data.time + " dial: " + data.value);
        });

    socket.on('wheel', function (data) {
            var user = data.pid + " " + data.guid;
            log(user + " " + data.time + " wheel: " + data.result);
            // move back to dial
            socket.emit('static', { "url": "/dial", "guid": data.guid });
        });

    // syncing event
    socket.on('log', function (data) {
            log(new Date().getTime() + " session: '" + data.session + "' sync: " + data.event);
        });


    // log something
    function log(message){
        var timestamp = new Date().getTime();
        // var logEntry = timestamp + " " + message + "\n";
        var logEntry = message + "\n";
        console.log("log: " + logEntry);

        try{
            logstream.write(logEntry);
        }
        catch(e){
            // console.log(e);
            console.log("failed to write to log file: " + logEntry);
        }
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

// get the session a given user is in
function getSessionForUser(guid){
    for (var i = 0; i < sessions.length; i++){
        var users = sessions[i].users;
        for (var j = 0; j < users.length; j++){
            if(guid === users[j].guid){
                return sessions[i].id;
            }
        }
    }
    return 0;
}

// a session - has id and list of users
var Session = function(nid){
    this.users = [];
    this.id = nid;
}

// a user - as a human-readable id (pid) and unique guid
var User = function(guid, pid){
    this.pid = pid;
    this.guid = guid;
}

/* guid generator */
function generateGuid() {
    return s4() + '-' + s4() + '-' + s4() + '-' + s4();
    // return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    //     s4() + '-' + s4() + s4() + s4();
}
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
