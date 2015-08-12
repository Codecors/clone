/*
 * Code to handle user clicks on SVG emotion wheel embedded in html page.
 * User can select up to a certain number (MAX_CHOICES) of emotions,
 * only one of each label
 *
 * number of emotions, number of strengths, circle ids are all hard-coded.
 *
 * Andy Brown.
 * andy.brown01@bbc.co.uk
 * BBC R&D. May 2015
 *
 */

/* ********************************************************* */
/* variables nodejs, is collected from nodeInit.js           */
/* ********************************************************* */


/* setup when wheel loaded */
function checkReady() {

    var svgElement = document.getElementById("wheel-svg");
    svgElement.addEventListener('load', function()
    {
        start();
    });

    setTimeout(start, 3000);  // double check it's worked...
}

/* add feedback fields and event listeners */
function start(){
    addFeedbackFields();
	addCircleListeners();
}

var svgDoc;


// wheel contains groups of 4 circles, one group per emotion
// ids are circleN-X
// N is number 1-4 representing strength of emotion
// X is letter to differentiate emotions

// the letters
var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',	'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'];

// how many are they allowed to select?
var MAX_CHOICES = 3;

// the labels, as map to letters above
var labels = ['shock', 'interest', 'anger', 'hate', 'amusement',
	'pride', 'joy', 'contentment', 'contempt', 'disgust', 'fear',
	'confusion', 'disappointment', 'relief', 'admiration', 'love',
	'guilt', 'regret', 'compassion', 'sadness'];
var otherLabel = null;

// a list of which circle ids are currently selected
var selection = [];
// a list of which circle ids have been selected since last submit
var allSelected = [];


checkReady();


/* add some lines to show which emotions have been selected */
function addFeedbackFields(){
    var fb1 = document.getElementById("emotion1");
    if(fb1 !== null){
        return;
    }

    // First set intructions to reflect number of choices
    var instruct1 = document.getElementById("number");
    instruct1.innerHTML = MAX_CHOICES;
    var instruct2 = document.getElementById("number2");
    instruct2.innerHTML = MAX_CHOICES;
}


/* add a listener to each circle in the wheel, plus neutral and other */
function addCircleListeners(){
	var svg = document.getElementById("wheel-svg");
	svgDoc = svg.contentDocument;

	// main emotions
	for(var i = 0; i < letters.length; i++){
		for(var j = 1; j <= 4; j++){
			var circle_id = "circle" + j + "-" + letters[i];
			enable(circle_id);
		}
	}

	// neutral and other
	enable('circle-neutral');
	enable('circle-other');
}


/* this circle has been clicked */
function select(circleid){
    allSelected.push(circleid);

	// update selection list
	if (selection.length < MAX_CHOICES){
		selection.push(circleid);
	}

    // prevent further selection if full, or neutral selected
    if(selection.length == MAX_CHOICES || selection[0] === 'circle-neutral'){
        stopAll();
    }

	// feedback change
	var c = svgDoc.getElementById(circleid);
	c.oldFill = c.style.fill;  // store original color
	c.style.fill = 'rgb(200, 200, 200)';  // set as grey
	c.onclick = function(){ deselect(this.id); };  // change click action

	// make other circles of same emotion un-selectable
	var etype = circleid.substring(circleid.length-1);
	for(var i = 0; i < 4; i++){
		var cid = 'circle' + (i+1) + "-" + etype;
		if(cid !== circleid){
			disable(cid);
		}
	}
    // only allowed neutral on it's own
    if(circleid !== 'circle-neutral'){
        disable('circle-neutral');
    }

	// set form fields
	setFields();

    // get what other actually is
    if(circleid === 'circle-other'){
        for (var i = 0; i < MAX_CHOICES; i++){
            if(selection[i] === 'circle-other'){
                otherLabel = prompt('Please specify the emotion','name strength');
                var textField = document.getElementById('emotion' + (i+1));
                textField.value = otherLabel;
            }
        }
    }

}


/* a circle has been de-selected */
function deselect(circleid){
    allSelected.push("-" + circleid);

	// change color
	resetColor(circleid);

	// reset array
	var ind = selection.indexOf(circleid);
	var newSelection = [];
	for(var i = 0; i < selection.length; i++){
		if(i != ind){
			newSelection.push(selection[i]);
		}
	}
	selection = newSelection;
	if(selection.length < MAX_CHOICES){
		// re-enable selection of all except selected?
		allowAll();
	}

	// re-enable interaction with other strengths of same emotion
	var svg = document.getElementById("wheel-svg");
	var svgDoc = svg.contentDocument;
	var etype = circleid.substring(circleid.length-1);
	for(var i = 0; i < 4; i++){
		var cid = 'circle' + (i+1) + "-" + etype;
		if(cid !== circleid){
			enable(cid);
		}
	}

	// update form fields
	setFields();
}


/* returns true if this circle is selected */
function isSelected(circleid){
	for(var i = 0; i < selection.length; i++){
		if(selection[i] === circleid){
			return true;
		}
	}
	return false;
}


/* returns true if this or another strength of this emotion is selected */
function hasSiblingSelected(circleid){
	if(circleid === 'circle-neutral' || circleid === 'circle-other'){
		return isSelected(circleid);
	}
	var letter = getLetter(circleid);
	for(var i = 0; i < selection.length; i++){
		if(getLetter(selection[i]) === letter){
			return true;
		}
	}
	return false;
}


/* disallow selection of any except selected */
function stopAll(){
	for(var i = 0; i < letters.length; i++){
		for(var j = 1; j <= 4; j++){
			var circle_id = "circle" + j + "-" + letters[i];
			if(!isSelected(circle_id)){
				disable(circle_id);
			}
		}
	}
	if(!isSelected('circle-neutral')){
		disable('circle-neutral');
	}
	if(!isSelected('circle-other')){
		disable('circle-other');
	}
}


/* allow selection of any circle, except those who have a sibling selected*/
function allowAll(){
	for(var i = 0; i < letters.length; i++){
		for(var j = 1; j <= 4; j++){
			var circle_id = "circle" + j + "-" + letters[i];
			if(!isSelected(circle_id) &! hasSiblingSelected(circle_id)){
				enable(circle_id);
			}
		}
	}
	if(!isSelected('circle-neutral')){
        if(selection.length == 0){
    		enable('circle-neutral');
        }
	}
	if(!isSelected('circle-other')){
		enable('circle-other');
	}
}


/* prevent interaction with this circle */
function disable(circleid){
	var c = svgDoc.getElementById(circleid);
	c.onclick = null;
	c.style.cursor = 'auto';
}


/* enable interaction with this circle (normal select) */
function enable(circleid){
	var c = svgDoc.getElementById(circleid);
	c.onclick = function(){ select(this.id); };
	c.style.cursor = 'pointer';
}


/* get a label for given id */
function getLabel(circleid){
	// form is: 'label N' where label is emotion name, N is strength number
	var emot = circleid.substring(6);
	if (emot == '-neutral'){
        var emo = emot.substring(1);
    }
    else if(emot == '-other'){
        var c = svgDoc.getElementById(circleid);
        if (otherLabel){
            var emo = otherLabel;
        }
        else{
    		var emo = emot.substring(1);
        }
	}
	else{
		var letter = getLetter(circleid);
		var label = labels[letters.indexOf(letter)];
		var strength = getNumber(circleid);
		var emo = label; // + " " + strength;
	}
	return emo;
}


/* get the color a circle is by default */
function getColor(circleid){
	var svg = document.getElementById("wheel-svg");
	var svgDoc = svg.contentDocument;
	var c = svgDoc.getElementById(circleid);
	if (c.oldFill){
		return c.oldFill;
	}
	var col = c.style.fill;
	if (col == 'rgb(255, 255, 255)'){
		col = 'rgb(0, 0, 0)';
	}
	return col;
}


/* get the letter from this circleid (type of emotion) */
function getLetter(circleid){
	var emot = circleid.substring(circleid.indexOf('-'));
	var letter = emot.substring(1);
	return letter;
}


/* get the number from this circleid (strength of emotion) */
function getNumber(circleid){
	var emot = circleid.substring(6);
	var strength = emot[0];
	return strength;
}


/* set feedback form fields to reflect selection array */
function setFields(){
    // remove current selection
    var feedback = document.getElementById('feedback');
    while(feedback.firstChild){
        feedback.removeChild(feedback.firstChild);
    }
    // now create items for current selection
    for (var i = 0; i < MAX_CHOICES; i++){
        if(selection[i]){
            var span = document.createElement('span');
            span.className = 'fb';
            span.name = 'fb-'+selection[i];
            var emo = getLabel(selection[i]);
            // var strength = getNumber(selection[i]);
            span.appendChild(document.createTextNode(emo)); // + "/4 "));

            var remBut = document.createElement('a');
            remBut.href = 'javacript::void();';
        	remBut.innerHTML = ' &otimes; ';
            remBut.name = 'fb-'+selection[i];
        	remBut.addEventListener('click', function(ev){
                var circle = this.name.substring(3);
                deselect(circle);
        	});
            span.appendChild(remBut);

            span.style.border = "4px solid " + getColor(selection[i]);
            feedback.appendChild(span);
        }
    }
}


/* submit pressed - save selection via xmlhttprequest */
function storeWheel(){
    // generate string
    var now = new Date();
    var resultsString = "";
    for (var i = 0; i < MAX_CHOICES; i++){
        if(selection[i]){
            var emo = getLabel(selection[i]);
            var strength = getNumber(selection[i]);
            resultsString += emo + " " + strength + ",";
}
        // var textField = document.getElementById('emotion' + (i+1));
        // resultsString += textField.value + ",";
    }

    var dataToServer = {
        "time": now.getTime(),
        "result": resultsString,
        "selection": selection,
        "all": allSelected.toString()
    };

    if(nodejs){
        sendSocketData('wheel', dataToServer);
    }
    else{
        // send data
    	var xmlhttp = new XMLHttpRequest();
    	xmlhttp.open("POST","./store.php",true);
    	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    	xmlhttp.send("result="+now+","+resultsString + "&selection="+selection.toString() + "&all="+allSelected.toString());
    }

    // clear wheel
	clear();
}


/* set a circle back to its original color */
function resetColor(circleid){
	var c = svgDoc.getElementById(circleid);
	c.style.fill = c.oldFill;
	enable(circleid);
}


/* return wheel and selection to original state */
function clear(){
	// deselect in reverse order
	for(var i = selection.length - 1; i >= 0; i--){
		deselect(selection[i]);
	}
    allSelected = [];
}
