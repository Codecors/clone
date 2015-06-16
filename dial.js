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

var storeInterval = 1000; // recording interval, in ms
var canvasArea = 500;  // width and height of (square) canvas with feedback wheel

// get the canvas, and specify dial view properties
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.lineCap = "round";
ctx.lineWidth = 20;

var canvas = document.getElementById("canvas");
// var canvasOffset = canvas.offset();
var offsetX = canvas.offsetLeft;
var offsetY = canvas.offsetTop;
var scrollX = canvas.scrollLeft;
var scrollY = canvas.scrollTop;

var isDown = false;
var startX;
var startY;

var PI2 = Math.PI * 2;
var faceRadius = 40;
canvas.width = canvasArea;
canvas.height = canvasArea+50;//(faceRadius*2);
var cx = canvasArea/2;
var cy = canvasArea/2;
var radius = canvas.width/3;
var strokewidth = radius/3;
var thumbAngle = PI2 / 30;
var faceRadius = 40;

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
    // no storage
}

var recents = [50];  // not used at the moment
var percent = 50;  // percentage like/dislike

draw();
store();

/**
 *  Draw the feedback dial
 */
function draw() {

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // circle

    // colour reflects % satisfaction
    var red = (100-percent)*2.55;
    var green = percent*2.55;
    var blue = (50-Math.abs(50-percent)) * 2.55;

    ctx.beginPath();
    // arc runs for 75% of circle, with gap at bottom
    ctx.arc(cx, cy, radius, Math.PI*0.75-(0.5*thumbAngle), (Math.PI*0.25)+(0.5*thumbAngle));
    ctx.strokeStyle = "rgb(" + parseInt(red) + "," + parseInt(green) + "," + parseInt(blue) + ")";
    ctx.lineWidth = strokewidth;
    ctx.stroke();

    // indicator
    ctx.beginPath();
    var radianAngle = Math.PI*0.75 + percent/100*(PI2*0.75);
    ctx.arc(cx, cy, radius, radianAngle - thumbAngle / 2, radianAngle + thumbAngle / 2);
    ctx.strokeStyle = "gold";
    ctx.lineWidth = strokewidth - 5;
    ctx.stroke();

    ctx.fillStyle = "gray";
    ctx.textAlign = "center";
    ctx.font = canvasArea/6 + "px arial";
    ctx.fillText(parseInt(percent) + "%", cx, cy + canvasArea/20);

    // draw face
    // function drawFace(context, happy, centerX, centerY, color){
    drawFace(ctx, true, canvas.width - (faceRadius + 5), canvas.height - (faceRadius + 5), 'rgb(0,255,0)');
    drawFace(ctx, false, faceRadius+5, canvas.height - (faceRadius + 5), 'rgb(255,0,0)');
    ctx.save();

    // line
    ctx.beginPath();
    ctx.moveTo(faceRadius*3, canvas.height - (faceRadius + 5));
    ctx.lineTo(canvas.width - (faceRadius*3),canvas.height - (faceRadius + 5));
    ctx.stroke();
    // arrowheads
    var arrlen=20, arrh=10;
    ctx.moveTo(faceRadius*3-5, canvas.height - (faceRadius + 5));
    ctx.lineTo(faceRadius*3+arrlen, canvas.height - (faceRadius + 5) + arrh);
    ctx.lineTo(faceRadius*3+arrlen, canvas.height - (faceRadius + 5) - arrh);
    ctx.lineTo(faceRadius*3-5, canvas.height - (faceRadius + 5));
    ctx.fill();
    ctx.moveTo(canvas.width - faceRadius*3 +5, canvas.height - (faceRadius + 5));
    ctx.lineTo(canvas.width - faceRadius*3 - arrlen, canvas.height - (faceRadius + 5) + arrh);
    ctx.lineTo(canvas.width - faceRadius*3 -arrlen, canvas.height - (faceRadius + 5) - arrh);
    ctx.lineTo(canvas.width - faceRadius*3 +5, canvas.height - (faceRadius + 5));
    ctx.fill();
}


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

function handleMouseMove(e) {
    // uncomment if you want to move slider only on drag instead of any mousemove
    //    if (!isDown) { return; }
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    var dx = mouseX - cx;
    var dy = mouseY - cy;
    percent = (e.clientX*100)/(2*cx);
    percent--;
    percent = Math.round(percent);
    draw(percent);
    recents.push(percent)
    // draw(Math.atan2(mouseY - cy, mouseX - cx));
}

function handleTouchMove(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
    percent = (touchobj.clientX*100)/(2*cx);
    percent--;
    percent = Math.round(percent);
    if (percent > 100){ percent = 100; }
    if(percent < 0){ percent = 0; }
    draw(percent);
    recents.push(percent)
}

canvas.onmousedown = function (e) {
    handleMouseDown(e);
};
canvas.ontouchstart = function (e) {
    handleMouseDown(e);
};
canvas.onmousemove = function (e) {
    handleMouseMove(e);
};
canvas.ontouchmove = function (e) {
    handleTouchMove(e);
};
canvas.onmouseup = function (e) {
    handleMouseUp(e);
};
/*canvas.ontouchend = function (e) {
    handleMouseUp(e);
};*/
canvas.onmouseout = function (e) {
    handleMouseOut(e);
};

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

/* draw a smileyface */
function drawFace(context, happy, centerX, centerY, color){
    var eyeRadius = 6;
    var eyeXOffset = 15;
    var eyeYOffset = 10;

    // draw the yellow circle
    context.beginPath();
    context.arc(centerX, centerY, faceRadius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'black';
    context.stroke();

    // draw the eyes
    context.beginPath();
    var eyeX = centerX - eyeXOffset;
    var eyeY = centerY - eyeXOffset;
    context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
    var eyeX = centerX + eyeXOffset;
    context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
    context.fillStyle = 'black';
    context.fill();

    // draw the mouth
    context.beginPath();
    if(happy){
        context.arc(centerX, centerY, faceRadius*0.7, Math.PI*0.1, 0.9*Math.PI, false);
    }
    else{
        context.arc(centerX, centerY+faceRadius*0.7, faceRadius*0.7, Math.PI*1.1, 0-Math.PI*0.1, false);
    }
    context.stroke();
}
