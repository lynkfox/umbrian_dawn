// Allow include of non-module script - https://stackoverflow.com/questions/5797852/
var fs = require("fs");

function read(f) {
  return fs.readFileSync(f).toString()
	.replace(/^const /, '')
	.replace(/\nconst /, '');
}
function include(f) {
	return eval.apply(global, [
		read(f + '.js') + '\n//# sourceURL=' + f
	]);
}

module.exports = { include };
