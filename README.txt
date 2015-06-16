User engagement toolset

Andy Brown
BBC R&D
andy.brown01@bbc.co.uk

June 2015

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

Visit localhost:8002/X

where X = empty or start - start view for setting up a user
X = remote - control view for experimenters
X = dial or wheel for direct view of each tool, but logging won't include
user id - best accessed via start page.
