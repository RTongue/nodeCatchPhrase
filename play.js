const net = require('net');
const columnify = require('columnify');
const _ = require('lodash');
const EOL = require('os').EOL;
const dEOL = EOL + EOL;
const { clear } = require('./utils');

const Game = require('./game.js');

function play (game) {
	game.start();
}

const newGame = new Game();
// play(newGame);

const telnetServer = net.createServer();
const PORT = 7777;

let connections = [];

telnetServer.listen(PORT, () => {
	console.log(`TCP server listening on ${PORT}`);
});

telnetServer.on('connection', (connection) => {
				
	clear(connection);
	connection.write('Welcome to Node Catch Phrase!\n');
	connection.write('Tell us your name: ');

	connection.on('end', () => {
		let idx = connections.indexOf(connection);
		connections = connections.splice(idx, 1);		
	});

	const extraNewline = () => connection.write(EOL);
	
	const preGameMessage = () => {
		const team1Names = newGame.team1.players.map(player => player.name);
		const team2Names = newGame.team2.players.map(player => player.name);
		// push an empty string to make sure there's a key 
		// for every value when we zip the arrays to an object
		team1Names.push('');
		team2Names.push('');

		let playerPairs = _.zipObject(team1Names, team2Names);
		return 'You\'re playing with:\n' + columnify(playerPairs, {columns: ['TEAM1', 'TEAM2']}) + '\nWhen all players have joined\npress ENTER to start!';
	}

	const preGame = (input) => {
		if (input && input.includes(13)) {
			newGame.start();	
		} else {
			connections.forEach(cnxn => {
				clear(cnxn);
				cnxn.write(preGameMessage());
			});
		}
	}

	const receiveName = (name) => {
		clear(connection);
		// add to collection of connections
		connection.name = name.toString().trim();
		connections.push(connection);
		// add player to a team
		newGame.addPlayer(connection);
		preGame(null);
		// Remove receive name listener
		connection.removeListener('data', receiveName);
		connection.on('data', preGame);
	};
	
	connection.on('data', extraNewline);
	connection.on('data', receiveName);

});
