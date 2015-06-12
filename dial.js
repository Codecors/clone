var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.lineCap = "round";
ctx.font = "24px arial";
ctx.lineWidth = 20;

var canvas = document.getElementById("canvas");//$("#canvas");
// var canvasOffset = canvas.offset();
var offsetX = canvas.offsetLeft;
var offsetY = canvas.offsetTop;
var scrollX = canvas.scrollLeft;
var scrollY = canvas.scrollTop;

var isDown = false;
var startX;
var startY;

var PI2 = Math.PI * 2;
var cx = canvas.width/2;
var cy = canvas.height/2;
var radius = 100;
var strokewidth = 25;
var thumbAngle = PI2 / 30;

var storeInterval = 1000; // recording interval, in ms

// nodejs stuff
var nodejs = false;
try{
    var urlarr = window.location.href.split("/");
    var server = urlarr[0] + "//" + urlarr[2]
    var socket = io.connect(server);
    console.log('connected');
    nodejs = true;
}
catch(e){
    // no storage
}

var recents = [50];
var percent = 50;

draw();
store();

function draw() {

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // circle
    var red = (100-percent)*2.55;
    var green = percent*2.55;
    var blue = (50-Math.abs(50-percent)) * 2.55;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI*0.75-(0.5*thumbAngle), (Math.PI*0.25)+(0.5*thumbAngle));
    ctx.strokeStyle = "rgb(" + parseInt(red) + "," + parseInt(green) + "," + parseInt(blue) + ")";
    ctx.lineWidth = strokewidth;
    ctx.stroke();

    // zero marker
    /* ctx.beginPath();
    ctx.moveTo(cx, cy + radius - strokewidth / 2);
    ctx.lineTo(cx, cy + radius + strokewidth / 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke(); */

    // indicator
    ctx.beginPath();
    // ctx.arc(cx, cy, radius, radianAngle - thumbAngle / 2, radianAngle + thumbAngle / 2);
    var radianAngle = Math.PI*0.75 + percent/100*(PI2*0.75);
    ctx.arc(cx, cy, radius, radianAngle - thumbAngle / 2, radianAngle + thumbAngle / 2);
    ctx.strokeStyle = "gold";
    ctx.lineWidth = strokewidth - 5;
    ctx.stroke();

    ctx.fillStyle = "gray";
    ctx.textAlign = "center";
    // ctx.fillText(parseInt(((radianAngle + PI2) % PI2) / PI2 * 100) + "%", cx, cy + 8);
    // ctx.fillText(parseInt(((radianAngle - Math.PI/2 + PI2) % PI2) / PI2 * 100) + "%", cx, cy + 8);
    ctx.fillText(parseInt(percent) + "%", cx, cy + 8);

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

canvas.onmousedown = function (e) {
    handleMouseDown(e);
};
canvas.onmousemove = function (e) {
    handleMouseMove(e);
};
canvas.onmouseup = function (e) {
    handleMouseUp(e);
};
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


function store(){
    var median = getMedian(recents);
    // console.log(recents);
    // console.log(median, new Date());
    var now = new Date();
    console.log(percent, now);
    if(nodejs){
        socket.emit('dial', { "time": now.toString(), "value": percent});
    }
    recents = [percent];
    window.setTimeout( store, storeInterval);

}
