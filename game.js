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
const chalk = require('chalk');
const _ = require('lodash');
const { clear, clearAll } = require('./utils');
const dict = require('./dictionary');

function Team (name) {
	this.name = name;
	this.score = 0;
	this.players = [];
	this.currentPlayer = null;
}

Team.prototype.styleName = function (color) {
	return chalk[color]('TEAM' + this.name);
};

function Game () {
	this.team1 = new Team('1');
	this.team2 = new Team('2');
	this.allPlayers = null;
	this.teamInPlay = null;
	this.nextTeam = null;
	this.currentPlayer = null;
	this.topic = 'javascript';
	this.wordBank = null;
	this.wordBankLength = null;
	this.timer = null;
	this.blinkers = [];
}

Game.prototype.start = function () {
	if (!this.wordBank) {
		this.wordBank = dict[this.topic];
		this.wordBankLength = this.wordBank.length;
		const coinToss = Math.random();
		if (coinToss > 0.5) {
			this.teamInPlay = this.team1;
			this.nextTeam = this.team2;
		} else {
			this.teamInPlay = this.team2;
			this.nextTeam = this.team1;
		}

		this.teamInPlay.currentPlayer = Math.floor(coinToss * 10) % this.teamInPlay.players.length;
	}

	if (!this.timer) {
		this.turn(null);
		this.startTimer();
	}
};

Game.prototype.turn = function (input) {
	if (input && input.includes(112)) {
		this.pass();
	}	else {
		// Clear screen for next turn
		clearAll(this.allPlayers);

		// On each turn, switch current team
		let holdTeam = this.nextTeam;
		this.nextTeam = this.teamInPlay;
		this.teamInPlay = holdTeam;

		// Move player pointer for current team
		this.teamInPlay.currentPlayer = this.teamInPlay.currentPlayer >= (this.teamInPlay.players.length - 1)
		? 0
		: (this.teamInPlay.currentPlayer + 1);

		// Set currentPlayer
		this.currentPlayer = this.teamInPlay.players[this.teamInPlay.currentPlayer];

		// Print message for this turn
		this.next();
	}
};

Game.prototype.pass = function () {
	const player = this.currentPlayer;
	// Register turn to player again
	player.once('data', this.turn.bind(this));
	// Clear player's screen only
	clear(player);
	// Give them a new word
	player.write(this.guessWordMessage());
};

Game.prototype.next = function () {
	let player = this.currentPlayer;

	// Register turn once on next data event
	player.once('data', this.turn.bind(this));

	// Give player word to guess
	player.write(this.guessWordMessage());
	// (`${player.name}, you're turn!\n---> ${this.generateWord()} <---\nNext => (n)\nPass => (p)\n`);

	// Get all teamMates minus player
	const teamMates = _.without(this.teamInPlay.players, player);
	// Tell them to guess
	teamMates.forEach(cnxn => {
		cnxn.write(chalk.yellow.bgGreen.bold('GUESS!!!'));
	});

	// Tell the other team to wait
	this.nextTeam.players.forEach(cnxn => {
		cnxn.write(chalk.yellow.bgRed.bold('WAIT...'));
	});
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

Game.prototype.guessWordMessage = function () {
	let player = this.currentPlayer;

	return `${chalk.red(player.name)}, you're turn!\n---> ${chalk.yellow(this.generateWord())} <---` + chalk.cyan(`\nNext => (n)`) + chalk.magenta(`\nPass => (p)\n`);
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
