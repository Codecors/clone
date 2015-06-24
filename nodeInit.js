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

var pid = null;
var stopLogging; // so we can stop continuous logging operations

// nodejs initiation
var urlarr = window.location.href.split("/");
var server = urlarr[0] + "//" + urlarr[2]
var socket = io.connect(server);
console.log('connected');
var nodejs = true;


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


// send pid and guid to server, and which page we want to go to
function start(destination){
    pid = document.getElementById('participantid').value;
    document.title += " " + pid;
    var sid = document.getElementById('sessions').value;
    socket.emit('start', { "pid": pid, "session": sid, "url": destination });
}
