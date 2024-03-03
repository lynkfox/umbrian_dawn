const assert = require('assert');
const { include, loadJSON, fake$ } = require('../helpers/helpers');
include('public/js/combine');
include('app/js/tripwire/genericSystemTypes');
fake$('dialog', arg => {});
include('app/js/dialogs/mass-dialog');

const sampleData = loadJSON('app/js-test/testdata/mass-sample');

describe('Mass panel', () => {
	describe('Parse mass data from mass.php', () => {
		const massData = parseMassData(sampleData.jumps);
		it('should parse simple records', () => {
			assert.deepEqual({
				originalMass: 1430000,
				mass: 1430000,
				higgs: false, prop: false,
				shipName: 'Cheetah',
				targetSystem: 31002437,
				characterName: 'Sublime Endeavor',
				time: "2024-03-03 18:35:29"
			}, massData.jumps[0]);
		});
		it('should parse JSON records (hot)', () => {
			assert.deepEqual({
				originalMass: 19200000,
				mass: 69200000,
				higgs: false, prop: true,
				shipName: 'Mastodon',
				targetSystem: 31002358,
				characterName: 'Marcus Domitius',
				time: "2024-03-03 15:07:52"
			}, massData.jumps[2]);
		});
		it('should parse JSON records (hot + higgs)', () => {
			assert.deepEqual({
				originalMass: 98400000,
				mass: 296800000,
				higgs: true, prop: true,
				shipName: 'Megathron',
				targetSystem: 31002437,
				characterName: 'Mars Retribution',
				time: "2024-03-03 15:04:31"
			}, massData.jumps[3]);
		});
	});
});
