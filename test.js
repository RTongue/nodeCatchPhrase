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
	});
});
