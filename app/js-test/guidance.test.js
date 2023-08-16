const assert = require('assert');
const { include } = require('./helpers/helpers');
include('public/js/combine');
include('app/js/guidance');
include('app/js/systemAnalysis');

options = { chain: { routeIgnore: { enabled: false } } };

describe('Pathfinding', () => {
	it('System to itself', () => { assert.deepEqual( [ sid('Amygnon') ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Amygnon'))); });
	it('Unroutable systems', () => { assert.deepEqual( null, guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('J163225'))); });
	it('Routable system to system', () => { assert.deepEqual( [ sid('Amygnon'), sid('Jufvitte'), sid('Ansalle'), sid('Gisleres'), sid('Scolluzer'), sid('Sortet') ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Sortet') )); });
	it('Routable system to system over limit', () => { assert.deepEqual( null, guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Sortet'), 4 )); });
	it('Routable system to system within limit', () => { assert.deepEqual( [ sid('Amygnon'), sid('Jufvitte'), sid('Ansalle'), sid('Gisleres'), sid('Scolluzer'), sid('Sortet') ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Sortet'), 5 )); });

});

function sid(systemName) {
	return Object.entries(appData.systems).filter(s => s[1].name === systemName)[0][0] - 30000000;
}