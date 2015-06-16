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

Implemented via node.js, html5 and svg.
To install, install nodejs, and socket.io (npm install socket.io).

To use, run 'node server.js'

Visit one of:

	http://localhost:8002/ - start page for registering a participant

	http://localhost:8002/control - control page for experimenters to change
		what individual participants view

	http://localhost:8002/dial - the dial

	http://localhost:8002/wheel - the emotion wheel

'localhost' can be replaced by IP address or url of hosting machine (accessible
via ifconfig command on terminal)

the last two (dial or wheel) give a direct view of each tool, but logging
won't include user id - these are best accessed via start page.
