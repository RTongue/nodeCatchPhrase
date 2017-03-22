const net = require('net');
const columnify = require('columnify');
const _ = require('lodash');
const EOL = require('os').EOL;
const dEOL = EOL + EOL;

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
				
	connection.write('\033[2J');
	connection.write('\033[0f');
	connection.write('Welcome to Node Catch Phrase!' + EOL);

	connection.on('end', () => {
		let idx = connections.indexOf(connection);
		connections = connections.splice(idx, 1);		
	});

	const extraNewline = () => connection.write(EOL);
	
	const preGameMessage = () => {
		const team1Names = newGame.team1.players.map(player => player.name);
		const team2Names = newGame.team2.players.map(player => player.name);
		let playerPairs = _.zipObject(team1Names, team2Names);
		return columnify(playerPairs, {columns: ['TEAM1', 'TEAM2']}) + '\nWhen all players have joined\npress ENTER to start!';
	}

	const preGame = (input) => {
		console.log(input);
		connection.write(pregameMessage());
	}

	const receiveName = (name) => {
		// add to collection of connections
		connection.name = name.toString().trim();
		connections.push(connection);
		// add player to a team
		newGame.addPlayer(connection);
		// Remove receive name listener
		connection.removeListener('data', receiveName);
		connection.write(preGameMessage());
		connection.on('data', preGame);
	};
	
	connection.on('data', extraNewline);
	connection.on('data', receiveName);

});
