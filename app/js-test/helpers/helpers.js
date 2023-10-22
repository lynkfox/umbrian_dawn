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

/** Fake out a call to $.ajax with static data from the given source */
function fakeAjax(url, responseFile) {
	let responseData = null; 
	if(responseFile) {
		responseData = fs.readFileSync(responseFile).toString();
		if(responseFile.endsWith('.json')) { responseData = JSON.parse(responseData); }
		if(!responseData) { throw "couldn't read " + responseFile; }
	}
	if(!global.$) { global.$ = {}; }
	const requestBuilder = {};
	requestBuilder.done = f => {
			f(responseData);
			return requestBuilder;
		};
	requestBuilder.fail = () => {};
	$.ajax = data => requestBuilder;		
}

module.exports = { include, fakeAjax };
