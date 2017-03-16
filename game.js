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

function Game () {
	this.team1 = 0;
	this.team2 = 0;
	this.teamInPlay = 'Team one';
	this.timer = null;
}

Game.prototype.start = function () {
	console.log('Welcome to Catch Phrase!');
	inquirer.prompt({
			type: 'list',
			name: 'start',
			message: `${this.teamInPlay}, you\'re up first.`,
			choices: ['Next (n)', 'Quit (q)']
		})	
	.then(answer => {
		if (answer.start === 'Next (n)') {
			this.next();
		}
	})
}

Game.prototype.next = function () {
	inquirer.prompt({
		type: 'list',
		name: 'next',
		message: this.generateWord(),
		choices: ['Next (n)', 'Pass (p)']
	})
}

Game.prototype.generateWord = function () {

}

const game = new Game();
game.start();
