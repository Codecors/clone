var fob = document.getElementById('fobButton');
fob.addEventListener('click', function(){
		fobPress();
});


// button pressed
function fobPress(){
	// feedback to user
	fob.className = 'fob pressed';
	setTimeout(function(){
		fob.className = 'fob';
	}, 1000);

	// tell server
	var now = new Date();
	var dataToServer = {
        "time": now.getTime(),
	};
	sendSocketData('fob', dataToServer);
}
