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


/****** ****** routing ****** ******/

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


/****** static content - probably want to load these from file ******/

var dialContent = "<div id='canvas' class='page-content'><div width='100%'><object id='wheel-svg' width='100%' type='image/svg+xml' data='./dial.svg'></object></div></div>"; // <script type='text/javascript' src='dialSVG.js'></script>
var dialScripts = ['/dialSVG.js'];
var wheelContent = "<h2>Select up to <span id='number'>N</span> emotions:</h2><p>Select an emotion that describes how you feel, then click on the circle that represents how strongly you feel.  You may select up to <span id='number2'>N</span>. To de-select an emotion, click on it again. Once you are happy, press submit.</p><div class='page-content'><div><object id='wheel-svg' width='100%' type='image/svg+xml' data='./customGEW.svg'></object></div><div id='feedback'></div><p><input type='submit' onclick='storeWheel()'/></p></div>"; //<script type='text/javascript' src='./gew.js'></script>;
var wheelScripts = ['./gew.js'];


/****** ****** message handling ****** ******/

io.sockets.on('connection', function (socket) {


    /****** session handling ******/

    // new session created
    socket.on('newsession', function(data) {
        var sid = data.sessionid;
        socket.join(sid);
        var sess = new Session(sid);
        sessions.push(sess);
        log('new session: ' + sid);
        // socket.emit('sessionlist', {'list': getSessionList()});
    });


    // session ended
    socket.on('endsession', function(data) {
        var sid = data.sessionid;
        // remove from session array
        for(var i = 0; i < sessions.length; i++) {
            var obj = sessions[i];
            if(sid.indexOf(obj.id) !== -1) {
                sessions.splice(i, 1);
            }
        }
        log('session end: ' + sid);
        // socket.emit('sessionlist', {'list': getSessionList()});
    });


    // request for list of sessions
    socket.on('sessions', function(data){
        socket.emit('sessionlist', {'list': getSessionList()});
    })


    // syncing event across session
    socket.on('log', function (data) {
            log(new Date().getTime() + " session: '" + data.session + "' sync: " + data.event);
        });


    // get a list of current session ids
    function getSessionList(){
        var ids = [];
        for(var i = 0; i< sessions.length; i++){
            ids.push(sessions[i].id);
        }
        return ids;
    }


    /****** new user registration ******/

    // start - new user registered - notify control page
    socket.on('start', function (data) {
        // console.log(data.pid + " is " + data.guid);
        var session = data.session;
        socket.join(session);
        console.log(data.pid + " joined room " + session + " - " + socket.id);
        for (var i = 0; i < sessions.length; i++){
            if (sessions[i].id === session){
                var user = new User(socket.id, data.pid);
                sessions[i].users.push(user);
            }
        }
        data.guid = socket.id;
        socket.broadcast.emit('newuser', data); // tell control page

        // and set user view as requested
        changeUserView(data.url, socket.id, data.session);
    });


    /****** results handling ******/

    // received data - store
    socket.on('dial', function (data) {
            var user = getPidForUser(socket.id) + " " + socket.id;
            log(user + " " + data.time + " dial: " + data.value);
        });

    socket.on('wheel', function (data) {
            var user = getPidForUser(socket.id) + " " + socket.id;
            // var user = data.pid + " " + data.guid;
            log(user + " " + data.time + " wheel: " + data.result);
            // move back to dial
            // changeUserView('/dial', socket.id, null);

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
            console.log("failed to write to log file: " + logEntry);
        }
    }


    /****** user view control ******/

    // we want to change what the user is seeing
    socket.on('static', function (data) {
            log("loading static page index: " + data.url);
            changeUserView(data.url, data.guid, data.session);
        });


    // set a user's page content
    function changeUserView(url, guid, session){
        var data = {};
        if(url === '/dial'){
            data.content = dialContent;
            data.scripts = dialScripts;
            data.title = "Dial testing ";
        }
        else if(url === '/wheel'){
            data.content = wheelContent;
            data.scripts = wheelScripts;
            data.title = "Emotion wheel ";
        }
        if(guid === 'all'){
            // socket.to(session).broadcast.emit('static', data);
            console.log("broadcasting to all in "+ session);
            io.to(session).emit('static', data);
        }
        else{
            console.log("sending message to " + guid);
            io.to(guid).emit('static', data);
            // socket.emit('static', data);
        }

    }

});


// get the pid a given user socket id
function getPidForUser(guid){
    for (var i = 0; i < sessions.length; i++){
        var users = sessions[i].users;
        for (var j = 0; j < users.length; j++){
            if(guid === users[j].guid){
                return users[j].pid;
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
