// const clear = function (connection) {
// 	connection.write('\033[d2J');
// 	connection.write('\033[0f');
// };
//
// const clearAll = function (connections) {
// 	connections.forEach(cnxn => clear(cnxn));
// };

const utils = {
	clear: connection => {
		connection.write('\033[2J');
		connection.write('\033[0f');
	},
	clearAll: connections => {
		connections.forEach(cnxn => {utils.clear(cnxn)});
	}

};

module.exports = utils/*{
	clear: connection => {
		connection.write('\033[2J');
		connection.write('\033[0f');
	},
	clearAll: connections => {
		connections.forEach(cnxn => {this.clear(cnxn)});
	}
	// clear,
	// clearAll
};*/
