appData.regions[10001000] = { name: 'Yasna Zakh' };
appData.factions[500029] = { name: 'Deathless Custodians' };
appData.systems[30100000] = {
	name: 'Zarzakh',
	regionID: 10001000,
	constellationID: 20010000,
	factionID: 500029,
	security: -1.0
};
appData.map.shortest[100000] = {};
[1041, 1269, 2086, 3841].forEach(function(x) { 
	appData.map.shortest[100000][x] = 0;
	appData.map.shortest[x][100000] = 0;
});