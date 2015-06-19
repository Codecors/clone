// get a GET parameter
function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
}

var guid = get('uid');
var pid = get('pid');
// var session;

if(pid){
    document.title += " " + pid;
}


// nodejs initiation
// will run without, but values only output to console
var nodejs = false;
var session;
try{
    var urlarr = window.location.href.split("/");
    var server = urlarr[0] + "//" + urlarr[2]
    var socket = io.connect(server);
    console.log('connected');
    nodejs = true;

    // find session:
    socket.emit('getSession', {"guid": guid});
    socket.on('isSession', function(data){
        session = data.sid;
    })

    // allow this page to be changed
    socket.on('static', function (data) {
        if(data.guid == guid || (data.guid === "all" && data.session === session)){
            location.assign(data.url + "?uid=" + guid + "&pid=" + data.pid);
        }
    });
}
catch(e){
    console.log("not saving through nodejs");
    // no storage
}
