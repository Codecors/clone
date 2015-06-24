-------------------------------------------------------------------------------

User engagement toolset

Andy Brown
BBC R&D
andy.brown01@bbc.co.uk

June 2015

-------------------------------------------------------------------------------

Web tools for capturing user engagement:

1.  Implementation of geneva emotion wheel
2.  Dial testing

Also control panel to change what participants see (wheel or dial).
Participants are registered by viewing start page, specifying PID, and which
tool to start on.  As participants are registered, they are loaded onto control
page.

Implemented via node.js, html5 and SVG.


Installation
-------------

To install, install nodejs, and socket.io (npm install socket.io).


Running
-------

To use, run 'node server.js'.  If you want to run on port 80, this needs to be
specified in server.js, and run as root.  Note that linux command is nodejs,
rather than node.


Usage
-----

1. Visit http://localhost:8002/control - this sets up a session, for which you
	need to enter an id.

2. Visit http://localhost:8002/ - start page for registering a participant - you
	need to select a session and give a participant id.  Also specify which
	view the user sees first.

3. The control page will load any participants registered, and can be used to
	change what each viewer in the session (or all) sees - dial or wheel.  The
	"log event" field allows other events to be logged.  "End session" means
	that this session is no longer an option for users to register with.


'localhost' can be replaced by IP address or url of hosting machine (accessible
via ifconfig command on terminal)

Data are stored in engagement.log - timestamp and userid differentiate users.
No coordination with media as yet.
