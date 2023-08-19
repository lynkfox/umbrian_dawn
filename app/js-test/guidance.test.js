const assert = require('assert');
const { include } = require('./helpers/helpers');
include('public/js/combine');
include('app/js/guidance');
include('app/js/guidance_profiles');
include('app/js/systemAnalysis');

options = { chain: { routeIgnore: { enabled: false } } };

describe('Pathfinding', () => {
	it('System to itself', () => { assert.deepEqual( [ sid('Amygnon') ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Amygnon'))); });
	it('Unroutable systems', () => { assert.deepEqual( null, guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('J163225'))); });
	it('Routable system to system', () => { assert.deepEqual( [ sid('Amygnon'), sid('Jufvitte'), sid('Ansalle'), sid('Gisleres'), sid('Scolluzer'), sid('Sortet') ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Sortet') )); });
	it('Routable system to system over limit', () => { assert.deepEqual( null, guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Sortet'), 4 )); });
	it('Routable system to system within limit', () => { assert.deepEqual( [ sid('Amygnon'), sid('Jufvitte'), sid('Ansalle'), sid('Gisleres'), sid('Scolluzer'), sid('Sortet') ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), sid('Sortet'), 5 )); });
	it('Routable using normal system IDs', () => { assert.deepEqual( 42, guidance.findShortestPath(appData.map.shortest, 30005003, 30001311 ).length); });
	it('Routable system to multiple options system within limit', () => { assert.deepEqual( [ sid('Amygnon'), sid('Jufvitte'), sid('Ansalle'), sid('Gisleres'), sid('Scolluzer'), sid('Sortet') ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), [sid('Sortet'), sid('Amarr')], 5 )); });
	it('Routable many-to-many', () => { assert.deepEqual( [ sid('Arnon'), sid('Aere'), sid('Hulmate') ], guidance.findShortestPath(appData.map.shortest, [sid('Amygnon'), sid('Arnon')], [sid('Sortet'), sid('Hulmate')] )); });
});

describe('Route to profile', () => {
	it('System to blue loot', () => { assert.deepEqual( [ sid('Amygnon'), sid("Intaki"), sid("Agoze"), sid("Ostingele"), sid("Harroule"), sid("MHC-R3"), sid("2X-PQG") ], guidance.findShortestPath(appData.map.shortest, sid('Amygnon'), guidance_profiles.blueLootSystems)); });
	
});

function sid(systemName) {
	return Object.entries(appData.systems).filter(s => s[1].name === systemName)[0][0] - 30000000;
}