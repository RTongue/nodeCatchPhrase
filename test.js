var expect = require('chai').expect;
var Game = require('./game.js');

describe('Catch Phrase', () => {

	let game;
	beforeEach(() => {
		game = new Game();
	});

	describe('Teams', () => {
		it('has two teams', () => {
			expect(game.team1).to.be.an('object');
			expect(game.team2).to.be.an('object');
		});

		it('teams alternate turns during gameplay', () => {

		});

		it('adds players to a team in an even fashion', () => {
			expect(game.team1.players).to.have.length(0);	
			expect(game.team2.players).to.have.length(0);
			for (var i = 0; i < 4; ++i) {
				game.addPlayer({name: `Player${i.toString()}`});
			}
			expect(game.team1.players).to.have.length(2);	
			expect(game.team2.players).to.have.length(2);
		});

		it('players alternate on each team', () => {

		});
	});
});
