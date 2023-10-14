const assert = require('assert');
const { include, fakeAjax } = require('./helpers/helpers');
include('public/js/lodash');

global.setInterval = () => {};
console.info = () => {};
guidance = { jumpCostModifiers:[] };
fakeAjax();

include('app/js/fw');

describe('Faction warfare', () => {
	it('System data parsed', () => { 
		fakeAjax('cached_third_party.php?key=fw', 'app/js-test/testdata/fw.json');
		fw.refresh();
		const data = fw.systems[30003842];
		assert.deepEqual(500001, data.occupier_faction_id);
	});
	// Routing is tested in guidance.test.js
	it('Samanuni Gate open when Athounon is Caldari', () => { 
		fakeAjax('cached_third_party.php?key=fw', 'app/js-test/testdata/fw.json');
		fw.refresh();
		assert.deepEqual(true, fw.SamanuniAthounonGateOpen);
		assert.deepEqual(1, fw.adjustJumpCost(3856, 45322, 1));
		assert.deepEqual(1, fw.adjustJumpCost(45322, 3856, 1));
		assert.deepEqual(1, fw.adjustJumpCost(45322, 3840, 1));	// check a different jump isn't blocked
	});	
	it('Samanuni Gate closed when Athounon is Gallente', () => { 
		fakeAjax('cached_third_party.php?key=fw', 'app/js-test/testdata/fw-athounon-gallente.json');
		fw.refresh();
		assert.deepEqual(false, fw.SamanuniAthounonGateOpen);
		assert.deepEqual(-1, fw.adjustJumpCost(3856, 45322));
		assert.deepEqual(-1, fw.adjustJumpCost(45322, 3856));
		assert.deepEqual(1, fw.adjustJumpCost(45322, 3840, 1));	// check a different jump isn't blocked
	});	
});