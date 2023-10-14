const assert = require('assert');
const { include, fakeAjax } = require('./helpers/helpers');
include('public/js/lodash');

global.setInterval = () => {};
console.info = () => {};
fakeAjax();

include('app/js/fw');

describe('Faction warfare', () => {
	it('System data parsed', () => { 
		fakeAjax('cached_third_party.php?key=fw', 'app/js-test/testdata/fw.json');
		fw = new _FactionWarfare();
		const data = fw.systems[30003842];
		assert.deepEqual(500001, data.occupier_faction_id);
	});
	it('Samanuni Gate open when Athounon is Caldari', () => { 
		fakeAjax('cached_third_party.php?key=fw', 'app/js-test/testdata/fw.json');
		fw = new _FactionWarfare();
		const data = fw.systems[30003856];
		assert.deepEqual(500001, data.occupier_faction_id);
	});	
	it('Samanuni Gate closed when Athounon is Gallente', () => { 
		fakeAjax('cached_third_party.php?key=fw', 'app/js-test/testdata/fw-athounon-gallente.json');
		fw = new _FactionWarfare();
		const data = fw.systems[30003856];
		assert.deepEqual(500004, data.occupier_faction_id);
	});	
});