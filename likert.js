var qfile = 'questions';
var xmlhttp = new XMLHttpRequest();
var questions = [];

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var qdata = JSON.parse(xmlhttp.responseText);
        writeQuestions(qdata);
    }
}

// write questions
function writeQuestions(qdata) {
    for(var i = 0; i < qdata.length; i++) {
		showQuestion(qdata[i]);
    }
}

function showQuestion(q){
	var list = document.getElementById("questionList");
	var item = document.createElement("li");
	var question = document.createTextNode(q.question);
    var likertList = document.createElement('ul');
    likertList.className = 'likert';
    var likLab1 = document.createElement('li');
    likLab1.appendChild(document.createTextNode("Strongly Agree"));
    likertList.appendChild(likLab1);
    questions.push(q.id);

    for (var i = 0; i < 7; i++){
        var likertItem = document.createElement('li');
        var radio = document.createElement('input');
        radio.type = "radio";
        radio.name = q.id;
        radio.value = i;
        radio.id = qfile + q.id + '-' + i;
        likertItem.appendChild(radio);
        likertList.appendChild(likertItem);
    }
    var likLab2 = document.createElement('li');
    likLab2.appendChild(document.createTextNode("Strongly Disagree"));
    likertList.appendChild(likLab2);

    item.appendChild(question);
    item.appendChild(likertList);
    list.appendChild(item);
}

function loadQuestions(){
	xmlhttp.open("GET", qfile + '.json', true);
	xmlhttp.send();
}

// report results to server...
function storeData(){
    var now = new Date();
    var selection = []

    // find out which were selected
    for (var i = 0; i < questions.length; i++){
        for (var j = 0; j < 7; j++){
            var radioId = qfile + questions[i] + '-' + j;
            var radioEl = document.getElementById(radioId);
            if (radioEl.checked){
                selection.push(radioId);
            }
        }
    }
    console.log(selection);

    // report selection:
    if(nodejs){
        socket.emit('questions', {
            "time": now.getTime(),
            "set": qfile,
            "selection": selection.toString()
        });
    }
}

loadQuestions();
