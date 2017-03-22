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
const inquirer = require('inquirer');
const fs = require('fs');
const sfx = require('sfx');
const dict = require('./dictionary');

function Team (name) {
	this.name = name;
	this.score = 0;
	this.players = [];
}

function Game () {
	this.team1 = new Team('1');
	this.team2 = new Team('2');
	this.teamInPlay = 'Team one';
	this.topic = 'javascript';
	this.timer = null;
}

Game.prototype.start = function () {
	console.log('Welcome to Catch Phrase!');
	inquirer.prompt({
			type: 'list',
			name: 'start',
			message: `${this.teamInPlay}, you're up first.`,
			choices: ['Next (n)', 'Quit (q)']
		})
	.then(answer => {
		if (answer.start === 'Next (n)') {
			this.next();
			this.startTimer();
		}
	});
};

Game.prototype.next = function () {
	inquirer.prompt({
		type: 'list',
		name: 'next',
		message: this.generateWord(),
		choices: ['Next (n)', 'Pass (p)']
	})
	.then(answer => {
		console.log('got an answer');
		if (!this.timer) this.startTimer();	
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
}

Game.prototype.generateWord = function () {
	const wordBank = dict[this.topic];
	const index = parseInt(fs.readFileSync('./index.txt', 'utf8'), 10) % wordBank.length;
	const word = wordBank[index];	
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
				sfx.basso(100);
			}, 5001);
		}, 10001)
	}, 12001);
}

module.exports = Game;
