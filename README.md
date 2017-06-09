# nodeCatchPhrase

A fun way to practice JavaScript terminology in the console! nodeCatchPhrase is inspired by the popular game Catch Phrase. Players connect to the server using node based web sockets and are randomly split up into two teams. When the game starts, a single player will see a term pop up on their screen. Without saying any of the words in the term, the player has to get his team members to guess the term by describing it to them. If the player's team has not guessed the term when the timer runs out, the other team gets a point! The first team to 10 points wins!

*Here's a sped-up demo showing a basic four player game:*
<a href="https://www.dropbox.com/s/fr7fvkaqueoyp6i/out"><img src="https://www.dropbox.com/s/fr7fvkaqueoyp6i/out.gif?raw=1" name="demo"/></a>

## Running your own nodeCatchPhrase server:

`git clone https://github.com/RTongue/nodeCatchPhrase.git`

`cd nodeCatchPhrase`

`npm install`

`npm start`

If players are on the same network as the server, they can connect via their console using:

`telnet [server's IP address here] 7777`

The dictionary always needs more terms! Will take PR's for more JavaScript terminology and other issues/improvements.

# Enjoy!
