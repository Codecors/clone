/*
  initiation stuff - start a socket.io session and get a participant id

  also contains code to update page content dynamically
*/

// load a javascript file dynamically
function loadJSFile(filename){
    var fileref=document.createElement('script')
    fileref.setAttribute("type","text/javascript")
    fileref.setAttribute("src", filename)
    document.getElementsByTagName("head")[0].appendChild(fileref)
}

var pid = null;  // participant id
var sid = null;  // session id
var oldsocketid = null; // the last socket id we had, so we can rejoin
var stopLogging; // so we can stop continuous logging operations
var connected = false;  // is the socket connection up?
var cache = []; // to collect data when no connection

// nodejs initiation
var urlarr = window.location.href.split("/");
var server = urlarr[0] + "//" + urlarr[2]
var socket = io.connect(server);

socket.on('connect', function(client){
    console.log('connected ');
    if(oldsocketid == null){
        oldsocketid = socket.io.engine.id;
    }
    connected = true;
});

socket.on('disconnect', function(){
    console.log("no connection");
    connected = false;
});

socket.on('reconnect', function(){
    console.log('reconnected');
    connected = true;
    if(oldsocketid != null){
        socket.emit('rejoin', { "pid": pid, "session": sid, "oldid": oldsocketid });
        oldsocketid = socket.id;
    }
    while(cache.length > 0){
        console.log('sending cached data');
        var cacheItem = cache.shift();
        socket.emit(cacheItem[0], cacheItem[1]);
    }
});

var nodejs = true;
var position = [0,0]; // store gps location


updateLocation();

// allow the content of this page to be changed
socket.on('static', function (data) {
    // stop any ongoing logging
    stopLogging = true;

    // update content
    var body = document.getElementById("content");
    body.innerHTML = data.content;

    // then get js to run...
    var scripts = data.scripts;
    for(var i = 0; i < scripts.length; i++){
        loadJSFile(scripts[i]);
    }

    // set title
    document.title = data.title + pid;

});


// send socket data, or cache it
// also adds postion information
function sendSocketData(message, data){
    data["location"] = position;
    if(connected){
        socket.emit(message, data);
    }
    else{
        // cache data
        var cacheItem = [message, data];
        cache.push(cacheItem);
    }
}


// send pid and guid to server, and which page we want to go to
function start(destination){
    pid = document.getElementById('participantid').value;
    document.title += " " + pid;
    sid = document.getElementById('sessions').value;
    socket.emit('start', { "pid": pid, "session": sid, "url": destination });
}

function updateLocation(){
    navigator.geolocation.getCurrentPosition(setLocation);
    setTimeout(updateLocation, 10000);
}

function setLocation(pos) {
    position = [pos.coords.latitude, pos.coords.longitude];
    console.log(position);
}
