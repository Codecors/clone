// dial visualiser
var participants = {};
var windowSize = 5; // length of rolling window
var binSize = 10;

// add a participant
function addParticipant(pid){
	participants[pid] = [];
}


// log a data value for a participant
function logNumber(pid, value){
	var arr = participants[pid];
	if (arr == null){
		addParticipant(pid);
		arr = participants[pid];
	}
	arr.push(value);
	if(arr.length > windowSize){
		arr.shift();
	}
}

// get median value for participant
function getMedianForParticipant(pid){
	var arr = participants[pid].slice(0);
	arr.sort();
	var median = arr[Math.round(arr.length/2)];
	return median;
}

// get an array containing the median value for each participant
function getMediansArray(){
	var allVals = [];
	for (var key in participants) {
	    allVals.push(getMedianForParticipant(key));
	}
	return allVals;
}

// get a median of all the values recorded
function getMedianForAll(){
	var allVals = [];
	for (var key in participants) {
	  if (participants.hasOwnProperty(key)) {
	    allVals = allVals.concat(participants[key]);
	  }
	}
	allVals.sort();
	var median = allVals[Math.round(arr.length/2)];
	return median;
}

// get an array of bins with each bin showing number
// of participants in that bin
// binSize defined globally, must be factor of 100
function getHistogramArray(medians){
	var histData = [];
	for (var i = 0; i<=100; i+=binSize){
		histData.push(0);
	}
	for(var i = 0; i < medians.length; i++){
		var bin = Math.floor(medians[i]/binSize);
		histData[bin] += 1;
	}

	// scale
	for(var i = 0; i < histData.length; i++){
		histData[i] /= medians.length;
		histData[i] *= 100;
	}
	return histData;
}

/* function tester(){
	for (var i = 0; i < 15; i++){
		var pid = "P" + i;
		addParticipant(pid);
	}
	dataGenerator();
}

function dataGenerator(){
	setTimeout(function(){
		for (var i = 0; i < 15; i++){
			var pid = "P" + i;
			var value = (Math.random()*70)+20;
			logNumber(pid, value);
		}
		dataGenerator();
	}, 300);
}

// tester();
*/
