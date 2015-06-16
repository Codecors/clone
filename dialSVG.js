/*
 * Javascript to support dial.html for dial testing
 *
 * User moves mouse (or touch?) across screen, to indicate
 * dislike (left)/like (right).  Feedack using coloured dial;
 * scores recorded at set intervalsusing nodejs
 *
 * Only tested in Chrome
 *
 * Andy Brown.
 * andy.brown01@bbc.co.uk
 * BBC R&D. June 2015
 *
 */

/* ********************************************************* */
// get guid and pid GET parameters from url

// get a GET parameter
function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
}

var guid = get('uid');
var pid = get('pid');
if(pid){
    document.title += " " + pid;
}

/* ********************************************************* */

var storeInterval = 400; // time in ms between each save to server

// other variables not really used
var isDown = false;
var startX;
var startY;
var offsetX = 0; // canvas.offsetLeft;
var offsetY = 0; // canvas.offsetTop;


// nodejs initiation
// will run without, but values only output to console
var nodejs = false;
try{
    var urlarr = window.location.href.split("/");
    var server = urlarr[0] + "//" + urlarr[2]
    var socket = io.connect(server);
    console.log('connected');
    nodejs = true;
    // allow this page to be changed
    socket.on('static', function (data) {
        if(data.guid == guid){
            location.assign(data.url + "?uid=" + guid + "&pid=" + data.pid);
        }
    });
}
catch(e){
    console.log("not saving through nodejs");
    // no storage
}

var recents = [50];  // not used at the moment
var percent = 50;  // percentage like/dislike

// add listeners and start storage
setTimeout("setup()", 500);


/**
 *  Adjust the feedback dial to suit current position
 *  Set colour, % value text, and marker position
 */
function draw(percent) {
    var svg = document.getElementById("wheel-svg");
    var svgDoc = svg.contentDocument;

    // colour
    var dial = svgDoc.getElementById("dial");
    var red = (100-percent)*2.55;
    var green = percent*2.55;
    var blue = (50-Math.abs(50-percent)) * 2.55;
    dial.style.fill = "rgb(" + parseInt(red) + "," + parseInt(green) + "," + parseInt(blue) + ")";;

    // text feedback
    var number = svgDoc.getElementById("percent");
    number.textContent = percent + "%";

    // marker position
    var marker = svgDoc.getElementById("marker");
    var angle = (percent*2.61); // degrees
    // circle centre is (372,351)
    var transformAttr = ' rotate(' + angle + ', 372, 351)';
    marker.setAttribute('transform', transformAttr);

}

/*
function handleMouseDown(e) {
    e.preventDefault();
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    // Put your mousedown stuff here
    isDown = true;
}

function handleMouseUp(e) {
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mouseup stuff here
    isDown = false;
}

function handleMouseOut(e) {
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mouseOut stuff here
    isDown = false;
}
*/

// mouse moved
function handleMouseMove(e) {
    // uncomment if you want to move slider only on drag instead of any mousemove
    //    if (!isDown) { return; }
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    var svg = document.getElementById("wheel-svg");
    percent = (e.clientX*100)/(svg.clientWidth);
    percent--;
    percent = Math.round(percent);
    if (percent > 100){ percent = 100; }
    if(percent < 0){ percent = 0; }
    draw(percent);
    recents.push(percent)
}

// touch moved
function handleTouchMove(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
    var svg = document.getElementById("wheel-svg");
    percent = (touchobj.clientX*100)/(svg.clientWidth);
    percent--;
    percent = Math.round(percent);
    if (percent > 100){ percent = 100; }
    if (percent < 0){ percent = 0; }
    draw(percent);
    recents.push(percent)
}


/*
 * add listeners for interaction
 * and start sending values to server
 */
function setup(){
    var svg = document.getElementById("wheel-svg");
    var canvas = svg.contentDocument;

    /* canvas.onmousedown = function (e) {
        // alert('clicked');
        handleMouseDown(e);
    };
    canvas.ontouchstart = function (e) {
        // alert('touched');
        handleMouseDown(e);
    }; */
    canvas.onmousemove = function (e) {
        handleMouseMove(e);
    };
    canvas.ontouchmove = function (e) {
        handleTouchMove(e);
    };
    /* canvas.onmouseup = function (e) {
        handleMouseUp(e);
    };
    canvas.ontouchend = function (e) {
        handleMouseUp(e);
    };
    canvas.onmouseout = function (e) {
        handleMouseOut(e);
    }; */
    draw(50);
    store();
}

/* calculate median value of array */
function getMedian(values) {
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

/**
 *  Save current value to nodejs server, if using (otherwise report to console)
 */
function store(){
    // var median = getMedian(recents);

    var now = new Date();
    if(nodejs){
        socket.emit('dial', { "time": now.toString(), "value": percent, "guid": guid});
    }
    else{
        console.log(percent, now);
    }
    recents = [percent];
    window.setTimeout( store, storeInterval);

}
