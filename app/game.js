/* eslint-disable max-len */
/* Game functionality:
 * - Game starts when all players have joined and
 *   someone pushes enter
 * - A player types 'n' (next) to signify the next player
 * - A player types 'p' (pass) to pass and get the next term
 * - Game state tracks which team is currently in play
 * - When the buzzer goes off, the team which is
 *   not currently in play gets a point
 * - Game tracks which team is now starting in play
 *   for the next round
 */

const fs = require('fs');
const sfx = require('sfx');
const columnify = require('columnify');
const chalk = require('chalk');
const _ = require('lodash');
const { clear, clearAll, blink, randomTimeGenerator } = require('./utils');
const dict = require('./dictionary');

function Team (name) {
	this.name = name;
	this.score = 0;
	this.players = [];
	this.currentPlayer = null;
}

// Currently doesn't work as columnify won't
// display the styled headers
Team.prototype.styleName = function styleName (color) {
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

Game.prototype.start = function start () {
	this.allPlayers.forEach(plyr => plyr.removeAllListeners('data'));

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

Game.prototype.turn = function turn (input) {
	if (input && input.includes(112)) {
		this.pass();
	}	else {
		// Clear screen for next turn
		clearAll(this.allPlayers, this.blinkers);

		// On each turn, switch current team
		const holdTeam = this.nextTeam;
		this.nextTeam = this.teamInPlay;
		this.teamInPlay = holdTeam;

		// Move player pointer for current team
		this.teamInPlay.currentPlayer = this.teamInPlay.currentPlayer >= (this.teamInPlay.players.length - 1)
																			? 0
																			: (this.teamInPlay.currentPlayer + 1);

		// Set currentPlayer
		this.currentPlayer = this.teamInPlay.players[this.teamInPlay.currentPlayer];

		// Print next message for this turn
		this.next();
	}
};

Game.prototype.pass = function pass () {
	const player = this.currentPlayer;
	// Register turn to player again
	player.once('data', this.turn.bind(this));
	// Clear player's screen only
	clear(player);
	// Give them a new word
	player.write(this.guessWordMessage());
};

Game.prototype.next = function next () {
	const player = this.currentPlayer;

	// Register turn once on next data event
	player.once('data', this.turn.bind(this));

	// Give player word to guess
	player.write(this.guessWordMessage());

	// Get all teamMates minus player
	const teamMates = _.without(this.teamInPlay.players, player);

	// Tell them to guess
	teamMates.forEach(cnxn => {
		this.blinkers.push(blink(cnxn, chalk.yellow.bold('GUESS!!!'), 'bgGreen'));
	});

	// Tell the other team to wait
	this.nextTeam.players.forEach(cnxn => {
		this.blinkers.push(blink(cnxn, chalk.yellow.bold('WAIT...'), 'bgRed'));
	});
};

Game.prototype.addPlayer = function addPlayer (player) {
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

Game.prototype.guessWordMessage = function guessWordMessage () {
	const player = this.currentPlayer;

	return `${chalk.red(player.name)}, you're turn!\n---> ${chalk.yellow(this.generateWord())} <---` + chalk.cyan('\nNext => (n)') + chalk.magenta('\nPass => (p)\n');
};

Game.prototype.generateWord = function generateWord () {
	let index = parseInt(fs.readFileSync('./index.txt', 'utf8'), 10);
	if (index === this.wordBankLength) index = 0;
	const word = this.wordBank[index];
	fs.writeFileSync('./index.txt', index + 1, 'utf8');
	return word;
};

Game.prototype.startTimer = function startTimer () {
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
				this.endRound();
			}, randomTimeGenerator(15000));
		}, randomTimeGenerator(25000));
	}, randomTimeGenerator(45000));
};

Game.prototype.endRound = function endRound () {
	// Clear the timer and messages
	clearInterval(this.timer);
	this.timer = null;
	sfx.basso(100);
	clearAll(this.allPlayers, this.blinkers);

	// Give next team a point
	this.nextTeam.score++;

	const team1 = this.team1.score;
	const team2 = this.team2.score;
	const currentPlayer = this.teamInPlay.players[this.teamInPlay.currentPlayer];
	let winner;
	const scores = {};
	scores[team1] = team2;

	// Check for a winner
	if (team1 === 10) {
		winner = this.team1.name;
	} else if (team2 === 10) {
		winner = this.team2.name;
	}

	if (winner) {
		this.team1.score = 0;
		this.team2.score = 0;
		this.allPlayers.forEach(player => {
			player.write(chalk.red.bold(`TEAM ${winner.toUpperCase()} WINS!!!\n`));
			player.write(chalk.cyan(chalk.underline('Final Score:\n') + columnify(scores, { columns: ['TEAM1', 'TEAM2'] }) + '\nHit enter to start next round.'));
			player.on('data', this.start.bind(this));
		});
	} else {
		this.allPlayers.forEach(player => {
			player.write(chalk.cyan('CURRENT SCORE\n' + columnify(scores, { columns: ['TEAM1', 'TEAM2'] }) + chalk.red.bold(`\n${currentPlayer.name}`) + ', hit enter to start.'));
			player.removeAllListeners('data');
		});
		currentPlayer.on('data', this.start.bind(this));
	}
};

module.exports = Game;
