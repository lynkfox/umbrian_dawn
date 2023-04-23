const assert = require('assert');
const { include } = require('./helpers/helpers');
include('public/js/combine');
include('app/js/tripwire/genericSystemTypes');
include('app/js/wormholeAnalysis');
include('app/js/systemAnalysis');

// temp
jQuery = { fn: {} };
include('app/js/helpers');

describe('Wormhole analysis', () => {
	const lowsec = appData.genericSystemTypes.indexOf('Low-Sec');
	describe('Target system ID', () => {
		it('Specific system', () => { assert.equal(wormholeAnalysis.targetSystemID('J123405', undefined), 31001031); });
		it('System type in text', () => { assert.equal(wormholeAnalysis.targetSystemID('Low-Sec', undefined), lowsec); });
		it('System type from wormhole type', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, 'U210'), lowsec); });
		it('Specific system from wormhole type', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, 'J377'), 30002086); });	// Turnur
		it('Unknown for K162', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, 'K162'), null); });
		it('Unknown for no information', () => { assert.equal(wormholeAnalysis.targetSystemID(undefined, undefined), null); });
	});

	describe('Eligible wormhole types', () => {
		const extractNames = types => ({ from: types.from.map(w => w.key), to: types.to.map(w => w.key) });
		
		it('Unknown at both sides', () => assert.deepEqual(wormholeAnalysis.eligibleWormholeTypes(undefined, undefined), null));
		
		it('Specific system at both sides', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(31001031, 30004137)), { from: ['U210'], to: ['X702', 'Z006'] }));	// C3 to LS
		it('Specific system to type', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(31001031, lowsec)), { from: ['U210'], to: ['X702', 'Z006'] }));
		it('Specific system to type (chain format)', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(31001031, '2|12354')), { from: ['D845'], to: ['X702', 'Z006'] }));	// C3 to HS
		it('Type to specific system', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(lowsec, 31001031)), { from: ['X702', 'Z006'], to: ['U210'] }));
		it('Type to type', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(6, 4)), { from: ['N766', 'L005'], to: ['Y683', 'M001'] }));	// C4 to C2
		describe('Special systems', () => {
			it('Type to Turnur', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(4, 30002086)), { from: ['A239', 'J377'], to: ['R943', 'L005'] }));	// C2 to Turnur
			it('Type to Vidette', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(4, 31000003)), { from: ['V928'], to: ['D382', 'L005'] }));	// C2 to Vidette
		});
		
		const c3_to_unknown = { 
			from: ['K346', 'U210', 'D845', 'A982', 'N770', 'T405', 'N968', 'I182', 'V301', 'Q003', 'G008', 'C008', 'M001', 'Z006', 'L005', 'E004', 'A009', 'F135', 'S877', 'B735', 'V928', 'C414', 'R259', 'F216', 'J377'],
			to: ['L477', 'M267', 'C247', 'N968', 'O477', 'O883', 'X702', 'Z006']
		}
		it('Specific system to unknown', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(31001031, undefined)), c3_to_unknown));
		it('Type to unknown', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(5, undefined)), c3_to_unknown));
		it('Unknown to specific system', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(undefined, 31001031)), { from: c3_to_unknown.to, to: c3_to_unknown.from }));
		
		it('Specific system to type, passing system objects', () => assert.deepEqual(extractNames(wormholeAnalysis.eligibleWormholeTypes(systemAnalysis.analyse(31001031), systemAnalysis.analyse(lowsec))), { from: ['U210'], to: ['X702', 'Z006'] }));
	});
});