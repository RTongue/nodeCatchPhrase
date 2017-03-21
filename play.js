var Game = require('./game.js');

function play (game) {
	game.start();
}

const newGame = new Game();
play(newGame);
