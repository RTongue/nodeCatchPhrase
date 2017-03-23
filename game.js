/* Game functionality:
 * - Game starts when a user runs start script
 * - A player types next (n) to signify the next player
 * - A player types pass (p) to pass and get the next term
 * - Game state tracks which team is currently in play
 * - When the buzzer goes off, the team which is
 *   not currently in play gets a point
 * - Game tracks which team is now starting in play
 *   for the next round
 */
// const inquirer = require('inquirer');
const fs = require('fs');
const sfx = require('sfx');
const columnify = require('columnify');
const _ = require('lodash');
const { clear } = require('./utils');
const dict = require('./dictionary');

function Team (name) {
	this.name = name;
	this.score = 0;
	this.players = [];
	this.currentPlayer = null;
}

function Game () {
	this.team1 = new Team('1');
	this.team2 = new Team('2');
	this.allPlayers = null;
	this.teamInPlay = null;
	this.topic = 'javascript';
	this.wordBank = null;
	this.wordBankLength = null;
	this.timer = null;
}

Game.prototype.start = function () {
	if (!this.wordBank) {
		this.wordBank = dict[this.topic];
		this.wordBankLength = this.wordBank.length;
		const coinToss = Math.random();
		this.teamInPlay = coinToss > 0.5
			? this.team1
			: this.team2;

		this.teamInPlay.currentPlayer = Math.floor(coinToss * 10) % this.teamInPlay.players.length;
	}

	if (!this.timer) {
		this.next();
		this.startTimer();
	}
};

Game.prototype.pass = function (input) {
	if (input && input.includes(32)) {
		console.log('in the condition');
		const player = this.teamInPlay.players[this.teamInPlay.currentPlayer];
		console.log(player.name);
		player.once('data', this.next.bind(this));
		clear(player);
		player.write(`${player.name}, you're turn!\n---> ${this.generateWord()} <---\nNext => Enter\nPass => Space`);
		player.once('data', this.next.bind(this));
		player.once('data', this.pass.bind(this));
	}
};

Game.prototype.next = function (input) {
	if (input && input.includes(32)) return;
	let player;
	let opponent = this.teamInPlay.name === '1'
									? this.team2
									: this.team1;

	if (opponent.currentPlayer === null) {
		opponent.currentPlayer = Math.floor(Math.random() * 10) % opponent.players.length;
	} else {
		let nextTeam = this.teamInPlay;
		this.teamInPlay = opponent;
		opponent = nextTeam;
	}
	player = this.teamInPlay.players[this.teamInPlay.currentPlayer];
	player.once('data', this.next.bind(this));
	player.once('data', this.pass.bind(this));
	clear(player);
	player.write(`${player.name}, you're turn!\n---> ${this.generateWord()} <---\nNext => Enter\nPass => Space`);

	const teamMates = _.without(this.teamInPlay.players, player);
	teamMates.forEach(cnxn => {
		clear(cnxn);
		cnxn.write('GUESS!!!');
	});

	opponent.players.forEach(cnxn => {
		clear(cnxn);
		cnxn.write('WAIT...');
	});

	// Move player pointer for current team
	this.teamInPlay.currentPlayer = this.teamInPlay.currentPlayer >= (this.teamInPlay.players.length - 1)
	? 0
	: (this.teamInPlay.currentPlayer + 1);
};

Game.prototype.addPlayer = function (player) {
	let team;
	if (this.team1.players.length > this.team2.players.length) {
		team = this.team2;
	} else if (this.team2.players.length > this.team1.players.length) {
		team = this.team1;
	} else {
		team = Math.random() > 0.5 ? this.team1 : this.team2;
	}

	team.players.push(player);
};

Game.prototype.generateWord = function () {
	let index = parseInt(fs.readFileSync('./index.txt', 'utf8'), 10);
	if (index === this.wordBankLength) index = 0;
	const word = this.wordBank[index];
	fs.writeFileSync('./index.txt', index + 1, 'utf8');
	return word;
};

Game.prototype.startTimer = function () {
	sfx.ping();
	this.timer = setInterval(sfx.ping, 1500);
	setTimeout(() => {
		clearInterval(this.timer);
		sfx.ping();
		this.timer = setInterval(sfx.ping, 1000);
		setTimeout(() => {
			clearInterval(this.timer);
			sfx.ping();
			this.timer = setInterval(sfx.ping, 500);
			setTimeout(() => {
				clearInterval(this.timer);
				this.timer = null;
				sfx.basso(100);
				const scoringTeam = this.teamInPlay === this.team1
															? this.team2
															: this.team1;
				scoringTeam.score++;
				const team1 = this.team1.score;
				const team2 = this.team2.score;
				const currentPlayer = this.teamInPlay.players[this.teamInPlay.currentPlayer]
				let winner;
				if (team1 === 10) {
					winner = this.team1.name;
				} else if (team2 === 10) {
					winner = this.team2.name;
				}
				if (winner) {
					this.allPlayers.forEach(player => {
						clear(player);
						player.write(`${winner.toUpperCase()} WINS!!!`)
					});
				} else {
					let scores = {};
					scores[team1] = team2;
					this.allPlayers.forEach(player => {
						clear(player);
						player.write('CURRENT SCORE\n' + columnify(scores, {columns: ['TEAM1', 'TEAM2']}) + `\n${currentPlayer.name}, hit enter to start.`);
						player.removeAllListeners('data');
					});
					currentPlayer.on('data', this.start.bind(this));
				}
			}, 5001);
		}, 10001);
	}, 12001);
};

module.exports = Game;
