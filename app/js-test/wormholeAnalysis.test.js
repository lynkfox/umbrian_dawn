const assert = require('assert');
const { include } = require('./helpers/helpers');
include('public/js/combine');
include('app/js/tripwire/genericSystemTypes');
include('app/js/wormholeAnalysis');

// temp
jQuery = { fn: {} };
include('app/js/helpers');

describe('Wormhole analysis', () => {
	describe('Target system ID', () => {
		const lowsec = appData.genericSystemTypes.indexOf('Low-Sec');
		it('Specific system', () => { assert.equal(wormholeAnalysis.targetSystemID('J123405', undefined), 31001031); });
		it('System type in text', () => { assert.equal(wormholeAnalysis.targetSystemID('Low-Sec', undefined), lowsec); });
		it('System type from wormhole type', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, 'U210'), lowsec); });
		it('Specific system from wormhole type', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, 'J377'), 30002086); });	// Turnur
		it('Unknown for K162', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, 'K162'), null); });
		it('Unknown for no information', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, undefined), null); });
	});

});