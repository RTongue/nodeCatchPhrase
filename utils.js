const chalk = require('chalk');

const utils = {
	clear: connection => {
		connection.write('\033[2J');
		connection.write('\033[0f');
	},
	clearAll: connections => {
		connections.forEach(cnxn => {utils.clear(cnxn)});
	},
	blink: (connection, message, bgColor) => {
		let calls = 0;
		return setInterval(() => {
			if (calls % 2 === 0) {
				utils.clear(connection);
				connection.write(chalk[bgColor](message));
			} else {
				utils.clear(connection);
				connection.write(message);
			}
			calls++;
		},750)
	}
};

module.exports = utils
