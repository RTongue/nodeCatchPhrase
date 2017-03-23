module.exports = {
	clear: connection => {
		connection.write('\033[2J');
		connection.write('\033[0f');
	},
}
