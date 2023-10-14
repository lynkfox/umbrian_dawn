const assert = require('assert');
const { include, fakeAjax } = require('./helpers/helpers');
fakeAjax('cached_third_party.php?key=fw', 'app/js-test/testdata/fw.json');
global.setInterval = () => {};
include('public/js/lodash');
include('app/js/fw');

describe('Faction warfare', () => {
	it('System data parsed', () => { 
		const data = fw.systems[30003842];
		assert.deepEqual(500001, data.occupier_faction_id);
	});
});